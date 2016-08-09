const multiparty = require('multiparty')
const uuid = require('node-uuid')
const aws = require('aws-sdk')
const path = require('path')
const mime = require('mime')
const sharp = require('sharp')

/**
 * Middleware to process multipart request with files
 * and store those files in Amazon S3. The file info
 * is stored under `ctx.request.body.files` object.
 * Each uploaded file is represented by object with
 * following fields:
 *
 * - fieldName: the key of the file in the multipart request
 * - originalFilename: the original file name with extension
 * - size: file size in bytes
 * - path: the relative path from the bucket root
 * - contentType: file content type from the part headers, if present
 * - bucket: S3 bucket
 * - etag
 * - url
 *
 * Does not support `multiple` upload.
 *
 * When `options.transform` is used the middleware can produce and upload more than one
 * file per file in the multipart request. For each transform object
 *
 * @param options.aws.access_key_id
 *
 *      AWS_ACCESS_KEY_ID to configure AWS SDK
 *
 * @param options.aws.secret_access_key
 *
 *      AWS_SECRET_ACCESS_KEY to configure AWS SDK
 *
 * @param options.aws.bucket
 *
 *      Amazon S3 bucket
 *
 * @param [options.allowedFiles] ()
 *
 *      Array of file names which are expected, all other files are ignored.
 *
 * @param [options.maxFileSize] (50 000 0000)
 *
 *      Max allowed size in bytes per file.
 *
 * @param [options.destination] (.)
 *
 *      Destination relative to bucket root, eg. '/images'
 *
 * @param [options.urlBase] (https://${options.bucket}.s3.amazonaws.com)
 *
 * @param [options.defaultContentType] (image/jpeg)
 *
 * @param [options.allowedFormats] (jpg, jpeg, png, pdf, webp, gif, tiff)
 *
 * @param [options.transform] array
 *
 *      Only for images (and pdf). If set, the image is converted to jpeg and transformed
 *      as needed. So far only `resize` is supported.
 *
 *      example:
 *
 *      [{
 *          resize: { width: MAX_WIDTH, height: MAX_HEIGHT },
 *          suffix: '_thumb',
 *          prefix: 'thumbnails'
 *       }]
 */
module.exports = function (options) {

    const s3Client = new aws.S3({
        accessKeyId: options.aws.access_key_id,
        secretAccessKey: options.aws.secret_access_key
    })

    // Check white list and delete files which were not expected
    const ignoreFile = function (options, info) {
        return options.allowedFiles && !options.allowedFiles.includes(info.fieldName)
    }

    const validateFile = function (options, info) {
        // Check file size and if it exceeds maximum, delete it
        if (info.size && info.size > options.maxFileSize) {
            const err = new Error('File too big')
            err.status = 422
            return err
        }

        // Check file content type, reject if not supported
        if (!options.allowedFormats.includes(mime.extension(info.contentType))) {
            const err = new Error('File type not supported')
            err.status = 422
            return err
        }
    }

    const processAndUploadFile = async function (options, info, part, upload) {
        const baseName = uuid.v4()

        let jobs

        if (options.transform) {

            const pipeline = sharp().toFormat('jpeg')

            jobs = options.transform.map(async rules => {
                const result = await transformImage(pipeline.clone(), rules)

                const imgInfo = Object.assign({}, info, result.info)

                imgInfo.prefix =  rules.prefix || ''
                imgInfo.suffix = rules.suffix || ''
                imgInfo.fieldName = imgInfo.fieldName + imgInfo.suffix
                imgInfo.name = (baseName + imgInfo.suffix + imgInfo.extension).toLowerCase()
                imgInfo.path = path.join(options.destination, imgInfo.prefix, imgInfo.name).replace(/^\//, '')

                const uploadInfo = await upload(imgInfo, result.data)

                imgInfo.url = options.urlBase ? path.join(options.urlBase, imgInfo.path): imgInfo.url

                return Object.assign(imgInfo, uploadInfo)
            })

            part.pipe(pipeline)

        } else {

            const work = async () => {
                info.name = (baseName + '.' + mime.extension(info.contentType)).toLowerCase()
                info.path = path.join(options.destination, info.name).replace(/^\//, '')

                const uploadInfo = await upload(info, part)

                info.url = options.urlBase ? path.join(options.urlBase, info.path): info.url

                return Object.assign(info, uploadInfo)
            }

            jobs = [work()]

        }

        return Promise.all(jobs)
    }

    const transformImage = function (sharpStream, options) {

        return new Promise((resolve, reject) => {

            sharpStream.on('error', function (err) {
                console.log(err)
                reject(err)
            })

            if (options.resize) {
                sharpStream.resize(options.resize.width, options.resize.height)
                sharpStream.max()
            }

            const meta = {
                format: 'jpeg',
                contentType: 'image/jpeg',
                extension: '.jpg'
            }

            resolve({ info: meta, data: sharpStream })
        })
    }

    const pipeToS3 = function (info, data) {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: info.bucket,
                Key: info.path,
                ACL: 'public-read',
                Body: data,
                ContentType: info.contentType,
            }

            const PART_SIZE_MB = 5
            const options = {
                partSize:  PART_SIZE_MB * 1024 * 1024,
                queueSize: 5
            }
            let fileSize = 0
            const handler = (err, data) => {
                if (err) {
                    return reject(err)
                }
                resolve({
                    etag: data.ETag,
                    url: data.Location,
                    size: fileSize
                })
            }

            const managedUpload = s3Client.upload(params, options, handler)

            managedUpload.on('httpUploadProgress', function (evt) {
                console.log('Progress:', evt.loaded, '/', evt.total)
                fileSize = evt.total
            })
        })
    }

    const enhanceContext = function (ctx, uploadedFiles) {
        ctx.request.body.files = ctx.request.body.files || {}
        uploadedFiles.forEach(info => {
            ctx.request.body.files[info.fieldName] = info
        })
    }

    return async function upload (ctx, next) {

        options.allowedFiles = options.allowedFiles || false
        options.allowedFormats = options.allowedFormats || ['jpg', 'jpeg', 'png', 'pdf', 'webp', 'gif', 'svg', 'tiff']
        options.maxFileSize = options.maxFileSize || 50000000
        options.destination = options.destination || ''
        // options.urlBase = options.urlBase || `https://${options.bucket}.s3.amazonaws.com`
        options.defaultContentType =  options.defaultContentType || 'image/jpeg'

        if (!options.aws) {
            throw new Error('[upload.s3] Missing AWS config')
        }

        await new Promise((resolve, reject) => {
            const form = new multiparty.Form(options)
            const errors = []
            const jobs = []

            form.on('part', function (part) {
                const info = {
                    fieldName: part.name,
                    originalFilename: part.filename,
                    size: part.byteCount,
                    contentType: part.headers['content-type'] || options.defaultContentType,
                    bucket: options.aws.bucket
                }

                if (ignoreFile(options, info)) {
                    return part.resume()
                }

                const err = validateFile(options, info)
                if (err) {
                    errors.push(err)
                    return part.resume()
                }

                const createJob = async () => {
                    const uploadedFiles = await processAndUploadFile(options, info, part, pipeToS3)
                    enhanceContext(ctx, uploadedFiles)
                }

                jobs.push(createJob())
            })

            form.on('field', function () { /* ignore fields */ })

            form.on('error', reject)

            form.on('close', function () {
                if (errors.length > 0) {
                    return reject(errors[0])
                }

                resolve(Promise.all(jobs))
            })

            // start the processing
            form.parse(ctx.req)
        })

        await next()
    }
}

const multiparty = require('multiparty')
const uuid = require('node-uuid')
const aws = require('aws-sdk')
const path = require('path')
const mime = require('mime')
const sharp = require('sharp')
const log = require('../helper/logger')

const DEFAULT_ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'pdf', 'webp', 'gif', 'svg', 'tiff']
const UPLOAD_PART_SIZE_MB = 5

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
 * @param {object} options Upload options
 *
 * @param {string }options.aws.access_key_id
 *
 *      AWS_ACCESS_KEY_ID to configure AWS SDK
 *
 * @param {string} options.aws.secret_access_key
 *
 *      AWS_SECRET_ACCESS_KEY to configure AWS SDK
 *
 * @param {string} options.aws.bucket
 *
 *      Amazon S3 bucket
 *
 * @param {array} options.allowedFiles ()
 *
 *      Array of file names which are expected, all other files are ignored.
 *
 * @param {number} options.maxFileSize (50 000 0000)
 *
 *      Max allowed size in bytes per file.
 *
 * @param {string} options.destination (.)
 *
 *      Destination relative to bucket root, eg. '/images'
 *
 * @param {string} options.urlBase (https://${options.bucket}.s3.amazonaws.com)
 *
 * @param {string} options.defaultContentType (image/jpeg)
 *
 * @param {array} options.allowedFormats (jpg, jpeg, png, pdf, webp, gif, tiff)
 *
 * @param {array} options.transform
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
 *
 * @return {function}
 */
module.exports = function uploadS3Middleware (options) {
    const s3Client = new aws.S3({
        accessKeyId: options.aws.access_key_id,
        secretAccessKey: options.aws.secret_access_key
    })

    /**
     * Check white list and delete files which were not expected
     *
     * @param  {object} opts Upload options
     * @param  {array}  opts.allowedFiles Array of allowed keys
     * @param  {object} info Current file info
     * @param  {object} info.fieldName Current field key
     * @return {bool}
     */
    function ignoreFile (opts, info) {
        return opts.allowedFiles && !opts.allowedFiles.includes(info.fieldName)
    }

    /**
     * @param  {object} opts Upload options
     * @param  {array}  opts.allowedFormats Array of allowed file formats
     * @param  {number} opts.maxFileSize Maximum file size in bytes
     * @param  {object} info Current file info
     * @param  {object} info.fieldName Current field key
     * @return {bool|Error} Returns validation error or true
     */
    function validateFile (opts, info) {
        // Check file size and if it exceeds maximum, delete it
        if (info.size && info.size > opts.maxFileSize) {
            const err = new Error('File too big')

            err.status = 422
            return err
        }

        // Check file content type, reject if not supported
        if (!opts.allowedFormats.includes(mime.extension(info.contentType))) {
            const err = new Error('File type not supported')

            err.status = 422
            return err
        }

        return true
    }

    /**
     * @param  {object} opts Upload options
     * @param  {object} info Current file info needed
     * @param  {ReadableStream} part Current file data
     * @param  {function} upload Function for uploading single file
     * @return {array} Array of info object about created and uploaded files
     */
    async function processAndUploadFile (opts, info, part) {
        const baseName = uuid.v4()

        if (opts.transform) {
            const pipeline = sharp().toFormat('jpeg')

            const jobs = opts.transform.map(async rules => {
                const result = await transformImage(pipeline.clone(), rules)

                const imgInfo = Object.assign({}, info, result.info)

                imgInfo.prefix = rules.prefix || ''
                imgInfo.suffix = rules.suffix || ''
                imgInfo.fieldName += imgInfo.suffix
                imgInfo.name = (baseName + imgInfo.suffix + imgInfo.extension).toLowerCase()
                imgInfo.path = path
                    .join(opts.destination, imgInfo.prefix, imgInfo.name)
                    .replace(/^\//, '')

                const uploadInfo = await pipeToS3(imgInfo, result.data)

                imgInfo.url = opts.urlBase
                    ? path.join(opts.urlBase, imgInfo.path)
                    : imgInfo.url

                return Object.assign(imgInfo, uploadInfo)
            })

            part.pipe(pipeline)

            return Promise.all(jobs)
        }

        /**
         * Uploads one file and returns file info
         * @return {object}
         */
        async function work () {
            info.name = `${baseName}.${mime.extension(info.contentType)}`.toLowerCase()
            info.path = path.join(opts.destination, info.name).replace(/^\//, '')

            const uploadInfo = await pipeToS3(info, part)

            info.url = opts.urlBase
                ? path.join(opts.urlBase, info.path)
                : info.url

            return Object.assign(info, uploadInfo)
        }

        return [work()]
    }

    /**
     * @param  {object} sharpStream Sharp library stream
     * @param  {object} opts Transformation settings
     * @return {Promise}
     */
    function transformImage (sharpStream, opts) {
        return new Promise((resolve, reject) => {
            sharpStream.on('error', err => {
                log.error(err)
                reject(err)
            })

            if (opts.resize) {
                sharpStream.resize(opts.resize.width, opts.resize.height)
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

    /**
     * @param  {object} info Uploaded file info
     * @param  {string} info.bucket S3 bucket to upload to
     * @param  {string} info.path Path in the S3 bucket
     * @param  {string} info.contentType File type
     * @param  {ReadbleStream|Buffer} data File data
     * @return {Promise}
     */
    function pipeToS3 (info, data) {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: info.bucket,
                Key: info.path,
                ACL: 'public-read',
                Body: data,
                ContentType: info.contentType,
            }

            const opts = {
                partSize: UPLOAD_PART_SIZE_MB * 1024 * 1024,
                queueSize: 5
            }
            let fileSize = 0

            const handler = (err, uploadResult) => err
                ? reject(err)
                : resolve({
                    etag: uploadResult.ETag,
                    url: uploadResult.Location,
                    size: fileSize
                })

            const managedUpload = s3Client.upload(params, opts, handler)

            managedUpload.on('httpUploadProgress', evt => {
                log.trace(info, `Progress: ${evt.loaded} / ${evt.total}`)
                fileSize = evt.total
            })
        })
    }

    /**
     * @param  {object} ctx Koa context
     * @param  {array} uploadedFiles Info about uploaded files
     * @return {undefined}
     */
    function enhanceContext (ctx, uploadedFiles) {
        ctx.request.body.files = ctx.request.body.files || {}
        uploadedFiles.forEach(info => {
            ctx.request.body.files[info.fieldName] = info
        })
    }

    return async function upload (ctx, next) {
        options.allowedFiles = options.allowedFiles || false
        options.allowedFormats = options.allowedFormats || DEFAULT_ALLOWED_FORMATS
        options.maxFileSize = options.maxFileSize || 50000000
        options.destination = options.destination || ''
        options.defaultContentType = options.defaultContentType || 'image/jpeg'

        if (!options.aws) {
            throw new Error('[upload.s3] Missing AWS config')
        }

        await new Promise((resolve, reject) => {
            const form = new multiparty.Form(options)
            const errors = []
            const jobs = []

            form.on('part', part => {
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

                if (err !== true) {
                    errors.push(err)
                    return part.resume()
                }

                /**
                 * Starts uploading file to Amazon S3
                 * @return {undefined}
                 */
                async function createJob () {
                    const uploadedFiles = await processAndUploadFile(options, info, part)

                    enhanceContext(ctx, uploadedFiles)
                }

                return jobs.push(createJob())
            })

            form.on('field', () => true)

            form.on('error', reject)

            form.on('close', () =>
                errors.length > 0
                    ? reject(errors[0])
                    : resolve(Promise.all(jobs))
            )

            // start the processing
            form.parse(ctx.req)
        })

        return await next()
    }
}

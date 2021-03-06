const multiparty = require('multiparty')
const fs = require('fs')
const os = require('os')
const uuid = require('node-uuid')
const path = require('path')

/**
 * @param  {string} file Path to a file
 * @return {undefined}
 */
function deleteFile (file) {
    fs.lstat(file.path, (err, stats) => {
        if (err || !stats.isFile()) {
            return
        }
        fs.unlink(file.path)
    })
}

/**
 * Middleware to process multipart request with files
 * and store those files on local disk. The file info
 * is stored under `ctx.request.body.files` object.
 * Each uploaded file is represented by object with
 * following fields:
 *
 * - fieldName: the key of the file in the multipart request
 * - originalFilename: the original file name with extension
 * - size: file size in bytes
 * - path: the absolute path to the uploaded file
 * - contentType: file content type from the part headers, if present
 * - url
 *
 * Does not support `multiple` upload.
 *
 * @param {object} options Upload settings
 *
 * @param {array} options.allowedFiles ()
 *
 *      Array of file names which are expected, all other files are ignored.
 *
 * @param {number} options.maxFileSize (50 000 0000)
 *
 *      Max allowed size in bytes per file.
 *
 * @param {string} options.uploadRootDir (OS temp directory)
 *
 *      Where to store the files.
 *
 * @param {string} options.destination (.)
 *
 *      Relative path to uploadRootDir, eg. '/images'
 *
 * @param {string} options.urlBase (options.destination)
 *
 * @param {object} options.multiparty
 *
 *      Is passed to `multiparty` Form constructor.
 *
 * @returns {async}
 */
module.exports = function uploadDiskMwFactory (options) {
    return async function uploadDiskMiddleware (ctx, next) {
        const allowedFiles = options.allowedFiles || false
        const maxFileSize = options.maxFileSize || 50000000
        const rootDir = options.uploadRootDir || os.tmpDir()
        const subDir = options.destination || ''
        const absoluteDir = path.join(rootDir, subDir)
        const urlBase = options.urlBase || subDir

        await new Promise((resolve, reject) => {
            const form = new multiparty.Form(options.multiparty)
            let error
            const jobs = []

            form.on('file', (name, file) => {
                /**
                 * Check white list and delete files which were not expected
                 */
                if (allowedFiles && !allowedFiles.includes(name)) {
                    return deleteFile(file)
                }

                /**
                 * Check file size and if it exceeds maximum, delete it
                 */
                if (file.size && file.size > maxFileSize) {
                    error = new Error('File too big')
                    error.status = 422
                    return deleteFile(file)
                }

                const job = new Promise((resolveJob, rejectJob) => {
                    /**
                     * Generate new filename and move file to destination directory
                     */
                    const base = uuid.v4()
                    const extension = path.extname(file.originalFilename)
                    const newName = (base + extension).toLowerCase()
                    const newPath = path.join(absoluteDir, newName)

                    fs.rename(file.path, newPath, err => {
                        if (err) {
                            return rejectJob(err)
                        }

                        file.path = newPath
                        file.name = newName
                        file.url = path.join(urlBase, newName)
                        file.contentType = file.headers['content-type']

                        ctx.request.body.files = ctx.request.body.files || {}
                        ctx.request.body.files[file.fieldName] = file

                        return resolveJob()
                    })
                })

                return jobs.push(job)
            })

            form.on('field', () => {
                // ignore fields
            })

            form.on('error', reject)

            form.on('close', () => {
                error ? reject(error) : resolve(Promise.all(jobs))
            })

            form.parse(ctx.req)
        })

        await next()
    }
}

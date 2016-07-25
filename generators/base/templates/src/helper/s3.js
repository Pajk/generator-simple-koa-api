const aws = require('aws-sdk')

const log = require('./logger')
const config = require('../config/aws')

const BASE_URL = `https://${config.bucket}.s3.amazonaws.com`

module.exports = {

    /**
     * Use to get pre-signed URL for direct upload to Amazon S3
     * @param fileName
     * @param fileType
     * @param uploadPath
     * @returns {Promise}
     */
    getUploadUrl (fileName, fileType, uploadPath = '') {
        const s3 = new aws.S3({
            accessKeyId: config.access_key_id,
            secretAccessKey: config.secret_access_key
        })

        const s3Params = {
            Bucket: config.bucket,
            Key: uploadPath + fileName,
            Expires: 60,
            ContentType: fileType,
            ACL: 'public-read'
        }

        return new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', s3Params, (err, data) => {
                if (err) {
                    log.error({ err }, 'Cant get S3 signed url')
                    return reject(err)
                }
                const returnData = {
                    signedRequest: data,
                    url: BASE_URL + `/${uploadPath}${fileName}`
                }
                log.info({ data: returnData }, 'S3 signed url generated')
                resolve({
                    upload_url: returnData.signedRequest,
                    url: returnData.url
                })
            })
        })
    }
}
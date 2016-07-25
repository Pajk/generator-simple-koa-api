const router = require('koa-router')()

const controller = require('./user.controller')
const upload = require('../../middleware/upload.s3')
const userConfig = require('../../config/user')
const awsConfig = require('../../config/aws')

router.post('create_user', '/users', controller.create)

router.post('create_avatar', '/users/avatar', upload({
    allowedFiles: ['file'],
    maxFileSize: userConfig.avatar_max_size_mb * 1024 * 1024,
    destination: userConfig.avatar_destination,
    transform: [{
        resize: { width: 500, height: 500 }
    }],
    bucket: awsConfig.bucket,
    access_key_id: awsConfig.access_key_id,
    secret_access_key: awsConfig.secret_access_key
}), controller.uploadAvatar)

router.get('/users', controller.renderCreate)

module.exports = router

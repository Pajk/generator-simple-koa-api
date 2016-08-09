const router = require('koa-router')()

const controller = require('./user.controller')
const upload = require('../../middleware/upload.s3')
const userConfig = require('../../config/user')
const awsConfig = require('../../config/aws')

router.post('createUser', '/users', controller.create)

router.post('createAvatar', '/users/avatar', upload({
    allowedFiles: ['file'],
    maxFileSize: userConfig.avatar_max_size_mb * 1024 * 1024,
    destination: userConfig.avatar_destination,
    transform: [{
        resize: { width: 500, height: 500 }
    }],
    aws: awsConfig
}), controller.uploadAvatar)

router.get('/users', controller.renderCreate)

module.exports = router
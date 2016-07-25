const router = require('koa-router')()

const auth = require('../../middleware/auth')
const controller = require('./profile.controller')

router.get('read_profile', '/profile', auth(), controller.get)

module.exports = router

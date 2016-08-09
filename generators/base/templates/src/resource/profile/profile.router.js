const router = require('koa-router')()

const auth = require('../../middleware/auth')
const controller = require('./profile.controller')

router.get('getProfile', '/profile', auth(), controller.get)
router.put('updateProfile', '/profile', auth(), controller.update)

module.exports = router

const router = require('koa-router')()

const auth = require('../../middleware/auth')
const controller = require('./session.controller')

router.post('createSession', '/session', controller.create)
router.del('deleteSession', '/session', auth(), controller.delete)

module.exports = router

const router = require('koa-router')()

const auth = require('../../middleware/auth')
const controller = require('./session.controller')

router.post('create_session', '/login', controller.create)
router.del('destroy_session', '/logout', auth(), controller.delete)

module.exports = router

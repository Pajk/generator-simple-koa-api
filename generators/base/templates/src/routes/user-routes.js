const router = require('koa-router')()

const auth = require('../middleware/auth')
const controller = require('../controller/user-controller')

router.post('signup', '/users', controller.create)
router.get('get profile', '/profile', auth(), controller.getCurrent)
router.post('login', '/login', controller.login)
router.del('logout', '/logout', auth(), controller.logout)

module.exports = router

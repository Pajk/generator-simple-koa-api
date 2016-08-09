const router = require('koa-router')()

const controller = require('./facebook.controller')

router.post('facebookLogin', '/facebook/login', controller.login)
router.post('facebookSignup', '/facebook/signup', controller.signup)

module.exports = router

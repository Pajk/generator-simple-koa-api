const route = require('koa-route')

const userController = require('../controller/user')

module.exports = function (app) {
    app.use(route.post('/users', userController.create))
    app.use(route.get('/users', userController.getList))
    app.use(route.get('/users/:user_id', userController.getOne))
}

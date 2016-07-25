const router = require('./user.router')

module.exports.init = function (app) {
    app
        .use(router.routes())
        .use(router.allowedMethods())

    app.user = require('./user.service')
}

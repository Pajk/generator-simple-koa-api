const router = require('./facebook.router')

module.exports.init = function (app) {
    app
        .use(router.routes())
        .use(router.allowedMethods())
}
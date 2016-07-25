const router = require('./session.router')
const service = require('./session.service')

module.exports.init = function (app) {
    app
        .use(router.routes())
        .use(router.allowedMethods())

    app.session = service
}

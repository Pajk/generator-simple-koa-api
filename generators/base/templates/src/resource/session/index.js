const router = require('./session.router')

module.exports.init = function sessionResourceInit (app) {
    app
        .use(router.routes())
        .use(router.allowedMethods())
}

const router = require('./facebook.router')

module.exports.init = function facebookResourceInit (app) {
    app
        .use(router.routes())
        .use(router.allowedMethods())
}

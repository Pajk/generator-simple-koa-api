const router = require('./user.router')

module.exports.init = function userResourceInit (app) {
    app
        .use(router.routes())
        .use(router.allowedMethods())
}

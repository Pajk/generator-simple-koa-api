const router = require('./profile.router')

module.exports.init = function profileResourceInit (app) {
    app
        .use(router.routes())
        .use(router.allowedMethods())
}

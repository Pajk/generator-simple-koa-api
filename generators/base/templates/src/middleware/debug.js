const log = require('../helper/logger')

module.exports = function (enabled) {
    return async (ctx, next) => {
        if (enabled) {
            log.debug({
                path: ctx.request.path,
                query: ctx.request.querystring,
                headers: ctx.request.headers,
                body: ctx.request.body
            }, 'DEBUG REQUEST INFO')
        }

        await next()

        if (enabled) {
            log.debug({
                status: ctx.status,
                response: ctx.body
            })
        }
    }
}

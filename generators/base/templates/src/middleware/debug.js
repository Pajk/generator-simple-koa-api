const _ = require('lodash')
const log = require('../helper/logger')

module.exports = async (ctx, next) => {
    const debug = process.env.DEBUG_REQUEST == 'true'
    if (debug) {
        log.debug({
            path: ctx.request.path,
            query: ctx.request.querystring,
            headers: ctx.request.headers,
            body: ctx.request.body
        }, 'DEBUG REQUEST INFO')
    }

    await next()

    if (debug) {
        log.debug({
            status: ctx.status,
            response: ctx.body
        })
    }
}

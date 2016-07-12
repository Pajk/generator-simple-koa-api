const _ = require('lodash')
const logger = require('../helper/logger')

module.exports = async (ctx, next) => {
    const debug = /debug/.test(ctx.request.querystring)
    if (debug) {

        logger.log('path', ctx.request.path)
        logger.log('query', ctx.request.querystring)
        logger.log('body', JSON.stringify(ctx.request.body))
        logger.log('headers', JSON.stringify(ctx.request.headers))

        if (ctx.request.body) {
            logger.log('multipart fields', JSON.stringify(ctx.request.body.fields))
            logger.log('multipart files keys', ctx.request.body.files ? _.keys(ctx.request.body.files) : null)
            logger.log('multipart files', JSON.stringify(ctx.request.body.files))
        }

    }

    await next()

    if (debug) {
        logger.log('status', ctx.status)
        logger.log('response', JSON.stringify(ctx.body))
    }
}

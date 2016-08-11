const logger = require('../helper/logger')

module.exports = function loggerMwFactory () {
    return async function middlewareFactory (ctx, next) {
        ctx.log = logger.child({})

        return await next()
    }
}

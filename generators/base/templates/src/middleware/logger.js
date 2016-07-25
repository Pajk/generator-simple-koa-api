const logger = require('../helper/logger')

//log.addSerializers({req: reqSerializer});

module.exports = function () {
    return async (ctx, next) => {

        ctx.log = logger.child({
        })

        await next()
    }
}

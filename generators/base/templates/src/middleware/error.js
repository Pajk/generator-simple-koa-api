const _ = require('lodash')
const logger = require('../helper/logger')

module.exports = async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        const body = {}

        body.status = err.status || 500
        body.title = err.title
        body.message = err.message || ctx.message

        if (err.type == 'invalid_request') {
            body.validation_messages = err.validation_messages
        }

        ctx.type = 'json'
        ctx.body = body
        ctx.status = body.status
        //console.log(err.stack)

        if (ctx.status > 403 && err) {
            const log = _.cloneDeep(body)

            Object.assign(log, err)

            if (!log.user_id && ctx.state.current_user) {
                log.user_id = ctx.state.current_user.user_id
            }

            if (err.stack) {
                const match = err.stack.match(/.*\/src\/.*/g)
                if (match) {
                    log.context = match.join('')
                }
            }

            logger.error(log)
        }
    }
}

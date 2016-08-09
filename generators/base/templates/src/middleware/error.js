const _ = require('lodash')
const logger = require('../helper/logger')

module.exports = function () {
    return async (ctx, next) => {
        try {
            await next()
        } catch (err) {
            const body = {}

            if (err.validation_messages) {
                body.errors = err.validation_messages
                delete err.validation_messages
            }

            if (err.isJoi) {
                body.errors = err.errors
            }

            if (err.name == 'SequelizeUniqueConstraintError') {
                body.errors = err.errors.reduce((errors, e) => {
                    errors[e.path] = e.message
                    return errors
                }, {})
                err.status = 422
            }

            body.status_code = err.status || 500
            body.title = err.title
            body.message = err.message || ctx.message

            ctx.type = 'json'
            ctx.body = body
            ctx.status = body.status_code
            //console.log(err.stack)

            if (ctx.status > 403 && err) {
                const log = _.cloneDeep(body)

                Object.assign(log, err)

                if (!log.user_id && ctx.state.user) {
                    log.user_id = ctx.state.user.user_id
                }

                if (err.stack) {
                    const match = err.stack.match(/.*\/src\/.*/g)
                    if (match) {
                        log.context = match.join('')
                    }
                }

                if (ctx.status >= 500) {
                    logger.error(log)
                } else {
                    logger.info(log)
                }
            }
        }
    }
}

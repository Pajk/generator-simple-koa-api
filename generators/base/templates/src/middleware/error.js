const _ = require('lodash')
const logger = require('../helper/logger')

/**
 * @param  {object} ctx Koa context
 * @param  {object} err Error
 * @return {undefined}
 */
function logError (ctx, err) {
    if (ctx.status > 403 && err) {
        const log = _.cloneDeep(ctx.body)

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

module.exports = function errorMwFactory () {
    return async function errorMiddleware (ctx, next) {
        try {
            await next()
        } catch (err) {
            const body = {}

            if (err.errors) {
                body.errors = err.errors
            }

            if (err.name === 'SequelizeUniqueConstraintError') {
                body.errors = err.errors.reduce((errors, error) => {
                    errors[error.path] = error.message
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

            logError(ctx, err)
        }
    }
}

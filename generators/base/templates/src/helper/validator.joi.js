const Joi = require('joi')

/**
 * @param  {Error} error Error instance
 * @param  {string} message Message to override error message
 * @return {Error}
 */
function createError (error, message) {
    error.message = message || error.message
    error.errors = error.details.reduce((errors, info) => {
        errors[info.path] = info.message
        return errors
    }, {})
    error.status = 422
    return error
}

module.exports = {
    create: schema => (fields, options) => {
        options = options || {}
        if (typeof options === 'string') {
            options = {
                message: options
            }
        }

        const result = Joi.validate(fields, schema, {
            abortEarly: false,
            context: options.context
        })

        if (result.error) {
            throw createError(result.error, options.message)
        }

        return result.value
    }
}

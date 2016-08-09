const _ = require('lodash')

const createMessage = function (validationMessages) {
    return _.map(validationMessages, message => message + '.').join(' ')
}

const createError = function (validationMessages, values, message) {
    const err = new Error()
    err.type = 'invalid_request'
    err.validation_messages = validationMessages
    err.message = message || createMessage(validationMessages)
    err.values = values
    err.status = 422

    return err
}

const checkPresence = function (required, fields) {
    if (required == undefined) {
        return {}
    }

    const validationMessages = {}

    _.forEach(required, function (message, key) {
        if (fields.hasOwnProperty(key) !== true) {
            return validationMessages[key] = message
        }
    })

    return validationMessages
}

const validateRule = function (rule, value) {
    const message = rule[0]
    const validator = rule[1]
    const params = rule.slice(2) || []

    // pass the field value as first parameter
    params.unshift(value)

    const result = validator.apply(null, params)

    if (result !== true) {
        return message
    }
}

const checkValues = function (rules, fields) {
    const validationMessages = {}
    let message

    _.forEach(rules, function (rule, key) {

        if (fields.hasOwnProperty(key) == false) {
            return
        }

        const ruleArray = rule[0].constructor === Array ? rule : [rule]
        const value = fields[key]

        if (value == null) {
            return
        }

        ruleArray.forEach(function (oneRule) {
            message = validateRule(oneRule, value)
            if (message) {
                validationMessages[key] = message
            }
        })
    })

    return validationMessages
}

module.exports = {
    create: (rules, required) => (fields, message) => {
        const missingFields = checkPresence(required, fields)
        const invalidFields = checkValues(rules, fields)
        const errors = Object.assign({}, missingFields, invalidFields)

        if (_.isEmpty(errors) === false) {
            throw createError(errors, null, message)
        }
    }
}

const _ = require('lodash')

const createMessage = function(validation_messages) {
    return _.map(validation_messages, (message) => {
        return message + '.'
    }).join(' ')
}

const createError = function(validation_messages, values, message) {
    const err = new Error()
    err.type = 'invalid_request'
    err.validation_messages = validation_messages
    err.message = message || createMessage(validation_messages)
    err.values = values
    err.status = 422

    return err
}

const checkPresence = function(required, fields) {
    if (required == undefined) {
        return {}
    }

    const validation_messages = {}

    _.forEach(required, function(message, key) {
        if (fields.hasOwnProperty(key) !== true) {
            return validation_messages[key] = message
        }
    })

    return validation_messages
}

const validateRule = function(rule, value) {
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

const checkValues = function(rules, fields) {
    const validation_messages = {}
    let message

    _.forEach(rules, function(rule, key) {

        if (fields.hasOwnProperty(key) == false) {
            return
        }

        const rule_arr = rule[0].constructor === Array ? rule : [rule]
        const value = fields[key]

        if (value == null) {
            return
        }

        rule_arr.forEach(function(one_rule) {
            message = validateRule(one_rule, value)
            if (message) {
                validation_messages[key] = message
            }
        })
    })

    return validation_messages
}

const validator = {}

validator.create = function (rules, required) {

    return function validator(fields, message) {
        const missing_fields = checkPresence(required, fields)
        const invalid_fields = checkValues(rules, fields)
        const errors = Object.assign({}, missing_fields, invalid_fields)

        if (_.isEmpty(errors) === false) {
            throw createError(errors, null, message)
        }
    }

}

module.exports = validator

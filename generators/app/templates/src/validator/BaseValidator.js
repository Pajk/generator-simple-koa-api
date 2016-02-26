'use strict'

var _ = require('lodash')

var baseValidatorFactory = function() {

  var checkPresence = function(required, fields) {
    if (required == undefined) {
      return {}
    }

    let validation_messages = {}

    required.forEach(function(key) {
      if (fields.hasOwnProperty(key) !== true) {
        return validation_messages[key] = 'required'
      }
    })

    return validation_messages
  }

  var validateRule = function(rule, value) {
    let message = rule[0]
    let validator = rule[1]
    let params = rule.slice(2) || []

    // pass the field value as first parameter
    params.unshift(value)

    let result = validator.apply(null, params)

    if (result !== true) {
      return message
    }
  }

  var checkValues = function(rules, fields) {
    let validation_messages = {}
    let message

    _.forEach(rules, function(rule, key) {

      if (fields.hasOwnProperty(key) == false) {
        return
      }

      let rule_arr = rule[0].constructor === Array ? rule : [rule]
      let value = fields[key]

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

  var validator = {}

  validator.create = function (rules, required) {

    return function validator(fields) {
      let missing_fields = checkPresence(required, fields)
      let invalid_fields = checkValues(rules, fields)
      let messages = Object.assign({}, missing_fields, invalid_fields)

      if (_.isEmpty(messages) === false) {
        throw validatorExceptionFactory().create(messages)
      }
    }

  }

  return validator
}

var validatorExceptionFactory = function() {

  var createMessage = function(validation_messages) {
    var msg = _.map(validation_messages, function(message, key) {
      return key + ': ' + message
    }).join('. ')

    return 'Invalid fields: ' + msg
  }

  var helper = {}

  helper.create = function(validation_messages) {
    return {
      name: 'ValidatorException',
      validation_messages: validation_messages,
      message: createMessage(validation_messages),
      status: 422
    }
  }

  return helper
}

// @autoinject
module.exports.base_validator = baseValidatorFactory

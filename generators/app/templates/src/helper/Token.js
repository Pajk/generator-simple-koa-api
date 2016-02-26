'use strict'

var jwt = require('njwt')
var thenify = require('thenify')
var verifyJwt = thenify(jwt.verify)
var FirebaseTokenGenerator = require('firebase-token-generator')

var authTokenHelperFactory = function (config) {

  var getSecret = function () {
    return config.auth.token_secret || 'supersecret'
  }

  var token_generator = new FirebaseTokenGenerator(getSecret())

  var getExpiresAt = function () {
    var now_unix_epoch = Math.floor(new Date().getTime()/1000)
    return now_unix_epoch + config.auth.token_validity
  }

  var helper = {}

  helper.create = function (user_id, expires_at, data) {
    var expires = expires_at || getExpiresAt()
    var payload = { uid: `${user_id}` }
    var options = { expires: expires }

    Object.assign(payload, data)

    return token_generator.createToken(payload, options)
  }

  helper.verify = function* (token) {
    var decoded = yield verifyJwt(token, getSecret())
    return decoded.body.d
  }

  return helper
}

// @autoinject
module.exports.token = authTokenHelperFactory
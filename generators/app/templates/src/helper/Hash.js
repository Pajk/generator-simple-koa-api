'use strict'

var credential = require('credential')
var pw = credential()

var hashHelperFactory = function () {

  var helper = {}

  helper.get = function* (pass) {
    let hash = yield pw.hash(pass)

    return Buffer(hash).toString('base64')
  }

  helper.verify = function* (hashObjectBase64, inputPassword) {
    let unbased = new Buffer(hashObjectBase64, 'base64').toString('ascii')

    return yield pw.verify(unbased, inputPassword)
  }

  return helper
}

// @autoinject
module.exports.hash = hashHelperFactory

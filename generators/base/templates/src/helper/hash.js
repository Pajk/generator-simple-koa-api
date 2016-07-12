'use strict'

const credential = require('credential')
const pw = credential({ work: 0.4 })

const helper = {}

helper.get = function* (pass) {
    const hash = yield pw.hash(pass)

    return Buffer(hash).toString('base64')
}

helper.verify = function* (hashObjectBase64, inputPassword) {
    const unbased = new Buffer(hashObjectBase64, 'base64').toString('ascii')

    return yield pw.verify(unbased, inputPassword)
}

module.exports = helper

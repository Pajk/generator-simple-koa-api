'use strict'

const hash = require('../helper/hash')
const msg = require('../config/msg')
const userData = require('../data/user')

const service = {}

service.create = function* (data) {
    try {
        if (data.password) {
            data.password = yield hash.get(data.password)
        }

        return yield userData.create(data)
    } catch(e) {
        const err = new Error()
        if (e.constraint == 'user_email_key') {
            err.message = msg.email_already_registered
            err.status = 403
            throw err
        }

        err.message = msg.user_unknown_error
        err.status = 500

        throw err
    }
}

service.login = function* (email, password) {
    const loaded_user = yield userData.getUserByEmail(email)
    const valid = yield hash.verify(loaded_user.password, password)

    return valid ? loaded_user : null
}

service.getList = userData.getList

service.getPublicList = userData.getPublicList

module.exports = service

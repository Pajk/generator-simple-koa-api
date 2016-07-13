const hash = require('../helper/hash')
const msg = require('../config/msg')
const userData = require('../data/user-data')
const log = require('../helper/logger')

const service = {}

service.create = async function (data) {
    try {
        if (data.password) {
            data.password = await hash.get(data.password)
        }

        return await userData.createUser(data)
    } catch(e) {
        log.trace({ type: 'signup_error', err: e })
        const err = new Error()
        err.message = msg.signup_error

        if (e.constraint == 'user_email_key') {
            err.status = 422
            err.validation_messages = {
                email: msg.email_already_registered
            }
            throw err
        }

        err.status = 500
        throw err
    }
}

service.login = async function (email, password) {
    const user = await userData.getUserWithPasswordByEmail(email)

    if (user && await hash.verify(user.password, password) == true) {
        return user
    }

    return null
}

module.exports = service

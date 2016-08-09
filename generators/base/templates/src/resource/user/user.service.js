const hash = require('../../helper/hash')
const msg = require('../../config/msg')
const log = require('../../helper/logger')
const userData = require('./user.data')

module.exports = {

    async create (data) {
        try {
            if (data.password) {
                data.password = await hash.get(data.password)
            }

            return await userData.createUser(data)
        } catch (e) {
            log.trace({type: 'signup_error', err: e})
            e.message = msg.signup_error
            throw e
        }
    },

    async login (email, password) {
        const user = await userData.getUserWithPasswordByEmail(email)

        if (user && await hash.verify(user.password, password) == true) {
            await user.update({ last_login: new Date() })

            return user
        }

        return null
    }
}
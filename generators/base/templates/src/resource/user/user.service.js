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
        } catch (err) {
            log.trace({ type: 'signup_error', err })
            err.message = msg.signup_error
            throw err
        }
    },

    async login (email, password) {
        const user = await userData.findUserByEmail(email)

        if (user && await hash.verify(user.password, password) === true) {
            await user.update({ last_login: new Date() })

            return user
        }

        return null
    }
}

const uuid = require('uuid')

const sessionData = require('./session.data')
const config = require('../../config/auth')
const token = require('../../helper/token')

const getExpiresAt = function (expiresIn) {
    const nowUnixEpoch = Math.floor(new Date().getTime()/1000)

    return nowUnixEpoch + expiresIn
}

const getDbToken = function (userId) {
    return (new Date().getTime()) + '-' + userId + '-' + uuid.v4()
}


module.exports = {

    async create (userId) {
        const dbToken = getDbToken(userId)
        const expiresIn = config.expires_in_seconds

        const payload = {
            user_id: userId,
            db_token: dbToken
        }

        const sessionToken = await token.create(payload, expiresIn)

        await sessionData.create(userId, dbToken, getExpiresAt(expiresIn))

        return sessionToken
    },

    async delete (userId) {
        await sessionData.delete(userId)
    }
}

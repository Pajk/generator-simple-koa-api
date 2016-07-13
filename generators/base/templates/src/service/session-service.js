const uuid = require('uuid')

const sessionData = require('../data/session-data')
const config = require('../config/auth')
const token = require('../helper/token')

const getExpiresAt = function(expires_in) {
    const now_unix_epoch = Math.floor(new Date().getTime()/1000)

    return now_unix_epoch + expires_in
}

const getDbToken = function(user_id) {
    return (new Date().getTime()) + '-' + user_id + '-' + uuid.v4()
}

const service = {}

service.create = async function (user_id) {
    const db_token = getDbToken(user_id)
    const expires_in = config.expires_in_seconds

    const payload = { user_id, db_token }
    const session_token = await token.create(payload, expires_in)

    await sessionData.create(user_id, db_token, getExpiresAt(expires_in))

    return session_token
}

service.delete = async function (user_id) {
    await sessionData.delete(user_id)
}

module.exports = service

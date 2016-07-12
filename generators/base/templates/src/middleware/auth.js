'use strict'

const logger = require('../helper/logger')
const config = require('../config')
const user_data = require('../data/user')
const token = require('../helper/token')

const isPublicRoute = function(method, path) {
    const normalized_path = config.api.normalize_path(path)
    const public_routes = config.api.public_routes[method.toUpperCase()]

    return public_routes && public_routes.indexOf(normalized_path) >= 0
}

module.exports = function* (next) {
    // public route and no authorization header -> let it pass
    if (isPublicRoute(this.method, this.path) && (!this.header.authorization || this.header.authorization == 'Bearer ')) {
        return yield next
    }

    let session_token,
        decoded

    this.state = this.state || {}

    if (!this.header.authorization) {
        logger.log('No Authorization header found.')
        this.throw(401, config.msg.auth_error)
    }

    const parts = this.header.authorization.split(' ')
    if (parts.length !== 2) {
        logger.log('Bad Authorization header format.')
        this.throw(401, config.msg.auth_error)
    }

    const scheme = parts[0]
    const hash = parts[1]

    if (/^Bearer$/i.test(scheme)) {
        session_token = hash
    }

    if (!session_token) {
        logger.log('Missing authorization token')
        this.throw(401, config.msg.auth_error)
    }

    try {
        decoded = yield token.verify(session_token)
    } catch (e) {
        logger.log('Invalid Authorization token.')
        this.throw(401, config.msg.auth_error)
    }

    if (typeof decoded.db_token !== 'string') {
        logger.log('Invalid Authorization token.')
        this.throw(401, config.msg.auth_error)
    }

    const current_user = yield user_data.getUserByToken(decoded.db_token)
    if (current_user === false) {
        logger.log('Session is no longer valid.')
        this.throw(401, config.msg.auth_error)
    }

    this.state.session_token = session_token
    this.state.session_db_token = decoded.db_token
    this.state.current_user = current_user

    return yield next
}

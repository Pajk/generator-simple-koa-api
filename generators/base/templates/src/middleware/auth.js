const log = require('../helper/logger')
const config = require('../config')
const user_data = require('../data/user')
const token = require('../helper/token')

const isPublicRoute = function(method, path) {
    const normalized_path = config.api.normalize_path(path)
    const public_routes = config.api.public_routes[method.toUpperCase()]

    return public_routes && public_routes.indexOf(normalized_path) >= 0
}

module.exports = async (ctx, next) => {
    // public route and no authorization header -> let it pass
    if (isPublicRoute(ctx.method, ctx.path) && (!ctx.header.authorization || ctx.header.authorization == 'Bearer ')) {
        return await next()
    }

    let session_token,
        decoded

    ctx.state = ctx.state || {}

    if (!ctx.header.authorization) {
        log.info('No Authorization header found.')
        ctx.throw(401, config.msg.auth_error)
    }

    const parts = ctx.header.authorization.split(' ')
    if (parts.length !== 2) {
        log.info('Bad Authorization header format.')
        ctx.throw(401, config.msg.auth_error)
    }

    const scheme = parts[0]
    const hash = parts[1]

    if (/^Bearer$/i.test(scheme)) {
        session_token = hash
    }

    if (!session_token) {
        log.info('Missing authorization token')
        ctx.throw(401, config.msg.auth_error)
    }

    try {
        decoded = await token.verify(session_token)
    } catch (e) {
        log.info('Invalid Authorization token.')
        ctx.throw(401, config.msg.auth_error)
    }

    if (typeof decoded.db_token !== 'string') {
        log.info('Invalid Authorization token.')
        ctx.throw(401, config.msg.auth_error)
    }

    const current_user = await user_data.getUserByToken(decoded.db_token)
    if (current_user === false) {
        log.info('Session is no longer valid.')
        ctx.throw(401, config.msg.auth_error)
    }

    ctx.state.session_token = session_token
    ctx.state.session_db_token = decoded.db_token
    ctx.state.current_user = current_user

    return await next()
}

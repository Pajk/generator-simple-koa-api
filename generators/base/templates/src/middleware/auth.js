const msg = require('../config/msg')
const userData = require('../data/user-data')
const token = require('../helper/token')

module.exports = function (options = {}) {
    return async (ctx, next) => {
        // public route and no authorization header -> let it pass
        if (options.public && (!ctx.header.authorization || ctx.header.authorization == 'Bearer ')) {
            return await next()
        }

        let session_token,
            decoded

        ctx.state = ctx.state || {}

        if (!ctx.header.authorization) {
            ctx.log.debug('No Authorization header found.')
            ctx.throw(401, msg.auth_error)
        }

        const parts = ctx.header.authorization.split(' ')
        if (parts.length !== 2) {
            ctx.log.debug('Bad Authorization header format.')
            ctx.throw(401, msg.auth_error)
        }

        const scheme = parts[0]
        const hash = parts[1]

        if (/^Bearer$/i.test(scheme)) {
            session_token = hash
        }

        if (!session_token) {
            ctx.log.debug('Missing authorization token')
            ctx.throw(401, msg.auth_error)
        }

        try {
            decoded = await token.verify(session_token)
        } catch (e) {
            ctx.log.debug('Invalid Authorization token.')
            ctx.throw(401, msg.auth_error)
        }

        if (typeof decoded.db_token !== 'string') {
            ctx.log.debug('Invalid Authorization token.')
            ctx.throw(401, msg.auth_error)
        }

        const current_user = await userData.getUserByToken(decoded.db_token)
        if (current_user === false) {
            ctx.log.debug('Session is no longer valid.')
            ctx.throw(401, msg.auth_error)
        }

        ctx.state.session_token = session_token
        ctx.state.session_db_token = decoded.db_token
        ctx.state.current_user = current_user

        await next()
    }
}

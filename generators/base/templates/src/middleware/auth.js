const msg = require('../config/msg')
const userData = require('../resource/user/user.data')
const token = require('../helper/token')

module.exports = function (options = {}) {
    return async (ctx, next) => {
        // public route and no authorization header -> let it pass
        if (options.public && (!ctx.header.authorization || ctx.header.authorization == 'Bearer ')) {
            return await next()
        }

        let sessionToken,
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
            sessionToken = hash
        }

        if (!sessionToken) {
            ctx.log.debug('Missing authorization token')
            ctx.throw(401, msg.auth_error)
        }

        try {
            decoded = await token.verify(sessionToken)
        } catch (e) {
            ctx.log.debug('Invalid Authorization token.')
            ctx.throw(401, msg.auth_error)
        }

        if (typeof decoded.db_token !== 'string') {
            ctx.log.debug('Invalid Authorization token.')
            ctx.throw(401, msg.auth_error)
        }

        const currentUser = await userData.getUserByToken(decoded.db_token)
        if (!currentUser) {
            ctx.log.debug('Session is no longer valid.')
            ctx.throw(401, msg.auth_error)
        }

        ctx.state.sessionToken = sessionToken
        ctx.state.sessionDbToken = decoded.db_token
        ctx.state.user = currentUser
        await next()
    }
}

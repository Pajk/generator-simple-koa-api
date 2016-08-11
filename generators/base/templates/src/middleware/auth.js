const userData = require('../resource/user/user.data')
const token = require('../helper/token')
const AuthError = require('../error/auth.error')

module.exports = function authMiddlewareFactory (options = {}) {
    /**
     * @param  {string} authorizationHeader Authorization header content
     * @return {bool} whether public access should be allowed
     */
    function allowPublicAccess (authorizationHeader) {
        return options.public
            && (!authorizationHeader || authorizationHeader === 'Bearer ')
    }

    /**
     * @param  {string} sessionToken Session token
     * @return {object} Session token claims
     */
    async function decodeToken (sessionToken) {
        try {
            return await token.verify(sessionToken)
        } catch (err) {
            throw new AuthError()
        }
    }

    /**
     * @param  {string} authorizationHeader Authorization header
     * @return {string} Session token
     */
    function extractTokenFromHeader (authorizationHeader) {
        if (!authorizationHeader) {
            throw new AuthError()
        }

        const parts = authorizationHeader.split(' ')

        if (parts.length !== 2) {
            throw new AuthError()
        }

        const scheme = parts[0]
        const sessionToken = parts[1]

        if (/^Bearer$/i.test(scheme) === false) {
            throw new AuthError()
        }

        return sessionToken
    }

    /**
     * @param  {string} dbToken Session's database token
     * @return {object} Loaded user instance
     */
    async function findUser (dbToken) {
        if (typeof dbToken !== 'string') {
            throw new AuthError()
        }

        const currentUser = await userData.findUserByToken(dbToken)

        if (!currentUser) {
            throw new AuthError()
        }

        return currentUser
    }

    return async function authMiddleware (ctx, next) {
        if (allowPublicAccess(ctx.header.authorization)) {
            return await next()
        }

        const sessionToken = extractTokenFromHeader(ctx.header.authorization)

        const decoded = await decodeToken(sessionToken)

        const currentUser = await findUser(decoded.db_token)

        ctx.state = ctx.state || {}
        ctx.state.sessionToken = sessionToken
        ctx.state.sessionDbToken = decoded.db_token
        ctx.state.user = currentUser

        return await next()
    }
}

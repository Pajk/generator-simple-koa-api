const sessionService = require('../session/session.service')
const facebookService = require('./facebook.service')
const validate = require('./facebook.validator')
const msg = require('../../config/msg')

module.exports = {

    async login (ctx) {
        const fbUserId = ctx.request.body.fb_user_id
        const fbAccessToken = ctx.request.body.fb_access_token

        if (!fbAccessToken || !fbUserId) {
            ctx.throw(422, 'Please allow access to your Facebook first.')
        }

        const userId = await facebookService.login(fbUserId, fbAccessToken)

        if (userId == false) {
            ctx.throw(403, 'Please sign up first.')
        }

        const token = await sessionService.create(userId)

        ctx.status = 200
        ctx.body = {
            id: userId,
            token: token
        }
    },

    async signup (ctx) {
        const body = validate(ctx.request.body, {
            message: msg.signup_error,
            context: {
                ip: ctx.ip
            }
        })

        const userId = await facebookService.signup(body)

        const sessionToken = await sessionService.create(userId)

        ctx.status = 201
        ctx.body = {
            id: userId,
            token: sessionToken
        }
    }
}

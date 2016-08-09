const validate = require('./session.validator')
const sessionService = require('./session.service')
const userService = require('../user/user.service')

const msg = require('../../config/msg')

module.exports = {

    async create (ctx) {
        const body = validate(ctx.request.body, msg.invalid_credentials)

        const user = await userService.login(body.email, body.password)

        if (!user) {
            ctx.throw(403, msg.invalid_credentials)
        }

        const sessionToken = await sessionService.create(user.id)

        ctx.status = 201
        ctx.body = {
            id: user.id,
            token: sessionToken
        }
    },

    async delete (ctx) {
        await sessionService.delete(ctx.state.sessionDbToken)
        ctx.status = 204
    }
}

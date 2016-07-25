const userService = require('../user/user.service')
const sessionService = require('./session.service')
const loginValidator = require('./session.validator')

const msg = require('../../config/msg')

module.exports = {

    async create (ctx) {
        loginValidator.validate(ctx.request.body, msg.invalid_credentials)

        const current_user = await userService.login(ctx.request.body.email, ctx.request.body.password)

        if (!current_user) {
            ctx.throw(403, msg.invalid_credentials)
        }

        const session_token = await sessionService.create(current_user.id)

        ctx.status = 201
        ctx.body = {
            id: current_user.id,
            token: session_token
        }
    },

    async delete (ctx) {
        await sessionService.delete(ctx.state.session_db_token)
        ctx.status = 204
    }
}

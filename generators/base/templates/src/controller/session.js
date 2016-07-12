const userService = require('../service/user')
const sessionService = require('../service/session')
const msg = require('../config/msg')

const controller = {}

controller.create = async ctx => {
    const params = ctx.request.body

    if (!params || !params.email || !params.password) {
        ctx.throw(403, msg.invalid_credentials)
    }

    const current_user = await userService.login(params.email, params.password)

    if (!current_user) {
        ctx.throw(403, msg.invalid_credentials)
    }

    const session_token = await sessionService.create(current_user.user_id)

    ctx.status = 201
    ctx.body = {
        user_id: current_user.user_id,
        session_token: session_token
    }
}

controller.delete = async ctx => {
    await sessionService.delete(ctx.state.session_db_token)
    ctx.status = 204
}


module.exports = controller

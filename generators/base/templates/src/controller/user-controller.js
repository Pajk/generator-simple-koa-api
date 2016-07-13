const userService = require('../service/user-service')
const sessionService = require('../service/session-service')

const signupValidator = require('../validator/signup')
const loginValidator = require('../validator/login')

const msg = require('../config/msg')

const controller = {}

controller.create = async function (ctx) {
    signupValidator.validate(ctx.request.body, msg.signup_error)

    const user_id = await userService.create(ctx.request.body)
    const session_token = await sessionService.create(user_id)

    ctx.status = 201
    ctx.body = {
        id: user_id,
        token: session_token
    }
}

controller.getCurrent = function (ctx) {
    ctx.body = { user: ctx.state.current_user }
    ctx.status = 200
}

controller.login = async ctx => {
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
}

controller.logout = async ctx => {
    await sessionService.delete(ctx.state.session_db_token)
    ctx.status = 204
}


module.exports = controller

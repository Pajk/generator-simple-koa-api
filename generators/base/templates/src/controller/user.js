const responseHelper = require('../helper/response')
const userService = require('../service/user')
const userValidator = require('../validator/user')
const sessionService = require('../service/session')

const controller = {}

controller.create = async function (ctx) {
    userValidator.validate(ctx.request.body)

    const user_id = await userService.create(ctx.request.body)
    const session_token = await sessionService.create(user_id)

    ctx.status = 201
    ctx.body = { user_id, session_token }
}

controller.getOne = async function (ctx, id) {
    ctx.body = await userService.get(id)
}

controller.getList = async function (ctx) {
    const loadedUsers = ctx.state.current_user
        ? await userService.getList(ctx.state.pagination)
        : await userService.getPublicList(ctx.state.pagination)

    ctx.body = responseHelper.format(loadedUsers, ctx.request.path, ctx.request.query, ctx.state.pagination)
}

module.exports = controller

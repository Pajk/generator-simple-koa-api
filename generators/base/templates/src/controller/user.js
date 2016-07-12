'use strict'

const responseHelper = require('../helper/response')
const userService = require('../service/user')
const userValidator = require('../validator/user')
const sessionService = require('../service/session')

const controller = {}

controller.create = function* () {
    userValidator.validate(this.request.body)

    const user_id = yield userService.create(this.request.body)
    const session_token = yield sessionService.create(user_id)

    this.status = 201
    this.body = { user_id, session_token }
}

controller.getOne = function* (id) {
    this.body = yield userService.get(id)
}

controller.getList = function* () {
    const loadedUsers = this.state.current_user
        ? yield userService.getList(this.state.pagination)
        : yield userService.getPublicList(this.state.pagination)

    this.state.pagination.force_offset = true
    this.body = responseHelper.format(loadedUsers, this.request.path, this.request.query, this.state.pagination)
}

module.exports = controller

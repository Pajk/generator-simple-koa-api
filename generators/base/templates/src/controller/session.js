'use strict'

const userService = require('../service/user')
const sessionService = require('../service/session')
const msg = require('../config/msg')

const controller = {}

controller.create = function* () {
    const params = this.request.body

    if (!params || !params.email || !params.password) {
        this.throw(403, msg.invalid_credentials)
    }

    const current_user = yield userService.login(params.email, params.password)

    if (!current_user) {
        this.throw(403, msg.invalid_credentials)
    }

    const session_token = yield sessionService.create(current_user.user_id)

    this.status = 201
    this.body = {
        user_id: current_user.user_id,
        session_token: session_token
    }
}

controller.delete = function* () {
    yield sessionService.delete(this.state.session_db_token)
    this.status = 204
}


module.exports = controller

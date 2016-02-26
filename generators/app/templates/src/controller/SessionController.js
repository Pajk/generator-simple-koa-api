'use strict'

var sessionControllerFactory = function (user_service, session_service, auth, config) {

  var controller = {}

  controller.create = function* () {
    let params = this.request.body

    if (!params || !params.email || !params.password) {
      this.throw(403, config.msg.invalid_credentials)
    }

    let current_user = yield user_service.login(params.email, params.password)

    if (!current_user) {
      this.throw(403, config.msg.invalid_credentials)
    }

    let session_token = yield session_service.create(current_user.user_id)

    this.status = 201
    this.body = {
      user_id: current_user.user_id,
      session_token: session_token
    }
  }

  controller.delete = function* () {
    yield session_service.delete(this.state.session_db_token)
    this.status = 204
  }

  return controller
}

// @autoinject
module.exports.session_controller = sessionControllerFactory

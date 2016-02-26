'use strict'

var userControllerFactory = function (config, user_service, user_validator, session_service, logger, response) {

  var controller = {}

  controller.create = function* () {
    user_validator.assertValid(this.request.body)

    let user_id = yield user_service.create(this.request.body)
    let session_token = yield session_service.create(user_id)

    this.status = 201
    this.body = {
      user_id: user_id,
      session_token: session_token
    }
  }

  controller.getOne = function* (id) {
    this.body = yield user_service.get(id)
  }

  controller.getList = function* () {
    let loaded_users = this.state.current_user ?
      yield user_service.getList(this.state.pagination) :
      yield user_service.getPublicList(this.state.pagination)

    this.state.pagination.force_offset = true
    this.body = response.format(loaded_users, this.request.path, this.request.query, this.state.pagination)
  }

  return controller
}

// @autoinject
module.exports.user_controller = userControllerFactory

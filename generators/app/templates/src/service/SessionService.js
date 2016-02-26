'use strict'

var sessionServiceFactory = function (auth, session) {

  var service = {}

  service.create = function* (user_id) {
    let data = yield auth.generateNewSession(user_id)
    yield session.create(user_id, data.db_token, data.expires_at)

    return data.session_token
  }

  service.delete = session.delete

  return service
}

// @autoinject
module.exports.session_service = sessionServiceFactory

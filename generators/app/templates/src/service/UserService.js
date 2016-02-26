'use strict'

var userServiceFactory = function (hash, config, user) {

  var service = {}

  service.create = function* (data) {
    try {
      if (data.password) {
        data.password = yield hash.get(data.password)
      }

      return yield user.create(data)
    } catch(e) {
      let err = new Error()
      if (e.constraint == 'user_email_key') {
        err.message = config.msg.email_already_registered
        err.status = 403
        throw err
      }

      err.message = config.msg.user_unknown_error
      err.status = 500

      throw err
    }
  }

  service.login = function* (email, password) {
    let loaded_user = yield user.raw.getUserByEmail(email)
    let valid = yield hash.verify(loaded_user.password, password)

    return valid ? loaded_user : null
  }

  service.getList = user.getList

  service.getPublicList = user.getPublicList

  return service
}

// @autoinject
module.exports.user_service = userServiceFactory


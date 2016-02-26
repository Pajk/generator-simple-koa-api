'use strict'

const uuid = require('uuid')

var authHelperFactory = function (config, user, token, logger) {

  var isPublicRoute = function(method, path) {
    let is_public_route = false
    var route

    if (method == 'POST') {
      route = path
      is_public_route = config.koa.public_routes_post.indexOf(route) >= 0
    } else if (method == 'GET') {
      route = path.replace(/\d+/g, ':id')
      is_public_route = config.koa.public_routes_get.indexOf(route) >= 0
    }

    return is_public_route
  }

  var getExpiresAt = function() {
    var now_unix_epoch = Math.floor(new Date().getTime() / 1000)
    var expires_in = config.auth.expires_in_seconds || 3600

    return now_unix_epoch + expires_in
  }

  var getDbToken = function(user_id) {
    return (new Date().getTime()) + '-' + user_id + '-' + uuid.v4()
  }

  // expose public methods
  var helper = {}

  helper.generateNewSession = function* (user_id) {
    var db_token = getDbToken(user_id)
    var expires_at = getExpiresAt()

    var payload = { user_id: user_id, db_token: db_token }

    var created_token = token.create(user_id, expires_at, payload)

    return {
      session_token: created_token,
      db_token: db_token,
      expires_at: expires_at
    }
  }

  // middleware
  helper.authenticate = function* (next) {
    // public route and no authorization header -> let it pass
    if (isPublicRoute(this.method, this.path) && (!this.header.authorization || this.header.authorization == 'Bearer ')) {
      return yield next
    }

    let session_token,
      decoded

    this.state = this.state || {}

    if (!this.header.authorization) {
      logger.log('No Authorization header found.')
      this.throw(401, config.msg.auth_error)
    }

    let parts = this.header.authorization.split(' ')
    if (parts.length !== 2) {
      logger.log('Bad Authorization header format.')
      this.throw(401, config.msg.auth_error)
    }

    let scheme = parts[0]
    let hash = parts[1]

    if (/^Bearer$/i.test(scheme)) {
      session_token = hash
    }

    if (!session_token) {
      logger.log('Missing authorization token')
      this.throw(401, config.msg.auth_error)
    }

    try {
      decoded = yield token.verify(session_token)
    } catch (e) {
      logger.log('Invalid Authorization token.')
      this.throw(401, config.msg.auth_error)
    }

    if (typeof decoded.db_token !== 'string') {
      logger.log('Invalid Authorization token.')
      this.throw(401, config.msg.auth_error)
    }

    let current_user = yield user.raw.getUserByToken(decoded.db_token)
    if (current_user === false) {
      logger.log('Session is no longer valid.')
      this.throw(401, config.msg.auth_error)
    }

    this.state.session_token = session_token
    this.state.session_db_token = decoded.db_token
    this.state.current_user = current_user

    return yield next
  }

  return helper
}

// @autoinject
module.exports.auth = authHelperFactory

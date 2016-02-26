'use strict'

var sessionModelFactory = function (db) {

  const TABLE = '"user_token"'

  var model = {}

  model.create = function* (user_id, db_token, expires_at) {
    if (!expires_at) {
      throw new Error('Missing expires_at attribute')
    }

    return yield db.query([
      'INSERT INTO', TABLE, '(user_id, token, expires_at)',
      'VALUES (?, ?, to_timestamp(?))', user_id, db_token, expires_at
    ])
  }

  model.delete = function* (db_token) {
    yield db.query([
      'DELETE FROM', TABLE, 'WHERE token = ?', db_token
    ])
  }

  return model
}

// @autoinject
module.exports.session = sessionModelFactory

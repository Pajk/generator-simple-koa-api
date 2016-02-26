'use strict'

var userModelFactory = function (db) {

  const TABLE = '"user"'

  var selection = [
    'id AS user_id',
    'name',
    'created_at'
  ]

  var model = {}

  model.create = function* (data) {
    var allowed = ['email', 'password', 'name']
    var insertion = db.filterFields(allowed, data)
    let result = yield db.query([
      'INSERT INTO', TABLE, 'VALUES ?', insertion, 'RETURNING id'
    ])

    return result.pop().id
  }

  model.getList = function* (pagination) {
    return yield db.query([
      'SELECT', selection.concat('email'),
      'FROM', TABLE,
      'LIMIT ? OFFSET ?', pagination.limit, pagination.offset
    ])
  }

  model.getPublicList = function* (pagination) {
    return yield db.query([
      'SELECT', selection,
      'FROM', TABLE,
      'LIMIT ? OFFSET ?', pagination.limit, pagination.offset
    ])
  }

  // results from raw objects must not be presented to the outside
  // world, use them for data manipulation in the app
  model.raw = {}

  model.raw.getUserByToken = function* (token) {
    let results = yield db.query([
      'SELECT id AS user_id, id, email, name FROM', TABLE,
      'WHERE id = (SELECT user_id FROM "user_token" WHERE token = ?)', token
    ])

    return results.length == 1 ? results.pop() : false
  }

  model.raw.getUserByEmail = function* (email) {
    let rows = yield db.query([
      'SELECT id AS user_id, password FROM', TABLE,
      'WHERE lower(email) = lower(?)', email
    ])

    return rows.length == 1 ? rows.pop() : null
  }

  return model
}

// @autoinject
module.exports.user = userModelFactory


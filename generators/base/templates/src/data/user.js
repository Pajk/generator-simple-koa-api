'use strict'

const db = require('../helper/db')

const selection = [
    'id AS user_id',
    'name',
    'created_at'
]

const TABLE = '"user"'

const dao = {}

dao.create = function* (data) {
    const allowed = ['email', 'password', 'name']
    const insertion = db.filterFields(allowed, data)
    const result = yield db.query([
        'INSERT INTO', TABLE, 'VALUES ?', insertion, 'RETURNING id'
    ])

    return result.pop().id
}

dao.getList = function* (pagination) {
    return yield db.query([
        'SELECT', selection.concat('email'), 'FROM', TABLE,
        'LIMIT ? OFFSET ?', pagination.limit, pagination.offset
    ])
}

dao.getPublicList = function* (pagination) {
    return yield db.query([
        'SELECT', selection, 'FROM', TABLE,
        'LIMIT ? OFFSET ?', pagination.limit, pagination.offset
    ])
}

dao.getUserByToken = function* (token) {
    const results = yield db.query([
        'SELECT id AS user_id, id, email, name FROM', TABLE,
        'WHERE id = (SELECT user_id FROM "user_token" WHERE token = ?)', token
    ])

    return results.length == 1 ? results.pop() : false
}

dao.getUserByEmail = function* (email) {
    const rows = yield db.query([
        'SELECT id AS user_id, password FROM', TABLE,
        'WHERE lower(email) = lower(?)', email
    ])

    return rows.length == 1 ? rows.pop() : null
}

module.exports = dao

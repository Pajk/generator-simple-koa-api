const db = require('../helper/db')
const paginationHelper = require('../helper/pagination')

const selection = [
    'id AS user_id',
    'name',
    'created_at'
]

const TABLE = '"user"'

const dao = {}

dao.create = async function (data) {
    const allowed = ['email', 'password', 'name']
    const insertion = db.filterFields(allowed, data)
    const result = await db.query([
        'INSERT INTO', TABLE, 'VALUES ?', insertion, 'RETURNING id'
    ])

    return result.pop().id
}

dao.getList = async function (pagination) {
    const pagination_query = paginationHelper.getQueryParts(pagination)

    return await db.query([
        'SELECT', selection.concat('email'), 'FROM', TABLE,
        ...pagination_query.limit
    ])
}

dao.getPublicList = async function (pagination) {
    const pagination_query = paginationHelper.getQueryParts(pagination)

    return await db.query([
        'SELECT', selection, 'FROM', TABLE,
        ...pagination_query.limit
    ])
}

dao.getUserByToken = async function (token) {
    const results = await db.query([
        'SELECT id AS user_id, id, email, name FROM', TABLE,
        'WHERE id = (SELECT user_id FROM "user_token" WHERE token = ?)', token
    ])

    return results.length == 1 ? results.pop() : false
}

dao.getUserByEmail = async function (email) {
    const rows = await db.query([
        'SELECT id AS user_id, password FROM', TABLE,
        'WHERE lower(email) = lower(?)', email
    ])

    return rows.length == 1 ? rows.pop() : null
}

module.exports = dao

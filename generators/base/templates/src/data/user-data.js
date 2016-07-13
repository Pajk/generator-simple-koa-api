const db = require('../helper/db')
const paginationHelper = require('../helper/pagination')

const selection = [
    'id',
    'first_name',
    'last_name',
    'created_at',
    'email'
]

const TABLE = '"user"'

const dao = {}

dao.createUser = async function (data) {
    const allowed = ['email', 'password', 'first_name', 'last_name']
    const insertion = db.filterFields(allowed, data)
    const result = await db.query([
        'INSERT INTO', TABLE, 'VALUES ?', insertion, 'RETURNING id'
    ])

    return result.pop().id
}

dao.getUsers = async function (pagination) {
    const pagination_query = paginationHelper.getQueryParts(pagination)

    return await db.query([
        'SELECT', selection, 'FROM', TABLE,
        ...pagination_query.limit
    ])
}

dao.getUserByToken = async function (token) {
    const results = await db.query([
        'SELECT ', selection ,'FROM', TABLE,
        'WHERE id = (SELECT user_id FROM "user_token" WHERE token = ?)', token
    ])

    return results.length == 1 ? results.pop() : false
}

dao.getUserWithPasswordByEmail = async function (email) {
    const rows = await db.query([
        'SELECT', selection.concat('password'), 'FROM', TABLE,
        'WHERE lower(email) = lower(?)', email
    ])

    return rows.length == 1 ? rows.pop() : null
}

module.exports = dao

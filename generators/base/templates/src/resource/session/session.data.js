const db = require('../../helper/db')

module.exports = {

    async create (user_id, db_token, expires_at) {
        if (!expires_at) {
            throw new Error('Missing expires_at attribute')
        }

        return await db.query([
            'INSERT INTO "user_token" (user_id, token, expires_at)',
            'VALUES (?, ?, to_timestamp(?))', user_id, db_token, expires_at
        ])
    },

    async delete (db_token) {
        await db.query([
            'DELETE FROM "user_token" WHERE token = ?', db_token
        ])
    }
}
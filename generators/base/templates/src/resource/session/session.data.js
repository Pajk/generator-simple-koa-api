const { Session } = require('../../model')

module.exports = {

    async create (userId, dbToken, expiresAt) {
        if (!expiresAt) {
            throw new Error('Missing expires_at attribute')
        }

        return await Session.create({
            user_id: userId,
            token: dbToken,
            expires_at: expiresAt
        })
    },

    async delete (dbToken) {
        await Session.destroy({
            where: { token: dbToken }
        })
    }
}

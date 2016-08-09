const { Facebook } = require('../../model')
const log = require('../../helper/logger')

module.exports = {
    async updateAccessToken (fbUserId, fbAccessToken) {
        return await Facebook.update({
            fb_access_token: fbAccessToken
        }, {
            where: {
                fb_user_id: fbUserId
            },
            returning: true,
            raw: true
        }).spread((affectedCount, affectedRows) => {
            if (affectedCount == 1) {
                return affectedRows[0].user_id
            }

            return false
        })
    },

    async assignToUser (userId, fbUserId, fbAccessToken) {
        try {
            await Facebook.create({
                user_id: userId,
                fb_user_id: fbUserId,
                fb_access_token: fbAccessToken
            })
        } catch(e) {
            log.error({
                user_id: userId,
                type: 'facebook signup',
                error: e
            })
            throw e
        }
    },

    async getLinkedUserId (fbUserId) {
        const record = await Facebook.find({
            fb_user_id: fbUserId
        })

        return record ? record.user_id : false
    }
}
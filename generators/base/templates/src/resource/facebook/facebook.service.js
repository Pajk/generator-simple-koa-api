const request = require('request-promise')
const config = require('../../config/facebook')
const log = require('../../helper/logger')
const msg = require('../../config/msg')
const userService = require('../user/user.service')
const userData = require('../user/user.data')
const facebookData = require('./facebook.data')

/**
 * @param  {string} fbUserId Facebook user id
 * @param  {string} token Facebook access token
 * @return {undefined} nothing
 */
async function validateAccessToken (fbUserId, token) {
    const data = await request({
        url: 'https://graph.facebook.com/debug_token?'
            + `input_token=${token}&access_token=${config.app_access_token}`,
        json: true
    }).then(response => response.data)

    if (data.is_valid !== true || data.app_id !== config.app_id || data.user_id !== fbUserId) {
        const err = new Error('Facebook login data are not valid.')

        log.debug({ data, token, fbUserId }, 'invalid facebook login')
        err.status = 403
        throw err
    }

    if (data.scopes.indexOf('email') < 0 || data.scopes.indexOf('public_profile') < 0) {
        const err = new Error(msg.facebook.permissions_needed)

        err.status = 403
        throw err
    }
}

/**
 * @param  {string} token Facebook access token
 * @return {undefined}
 */
async function getUserInfo (token) {
    return await request({
        url: `https://graph.facebook.com/me?fields=email,name&access_token=${token}`,
        json: true
    })
}

module.exports = {

    async login (fbUserId, fbAccessToken) {
        await validateAccessToken(fbUserId, fbAccessToken)

        let userId = await facebookData.updateAccessToken(fbUserId, fbAccessToken)

        // if fb user is not in our db try to find user with the same email address
        if (userId === false) {
            const fbInfo = await getUserInfo(fbAccessToken)
            const user = await userData.findUser({ email: fbInfo.email })

            if (user) {
                await facebookData.assignToUser(user.id, fbUserId, fbAccessToken)
                userId = user.id
            }
        }

        return userId
    },

    async signup (data) {
        const fbUserId = data.fb_user_id
        const fbAccessToken = data.fb_access_token

        await validateAccessToken(fbUserId, fbAccessToken)

        let userId = await facebookData.getLinkedUserId(fbUserId)

        if (userId) {
            const err = new Error(msg.facebook.already_signed_up)

            err.status = 403
            throw err
        }

        userId = await userService.create(data)

        await facebookData.assignToUser(userId, fbUserId, fbAccessToken)
    }
}

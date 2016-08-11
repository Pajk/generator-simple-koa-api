/* eslint-disable no-process-env */
module.exports = {
    app_id: process.env.FACEBOOK_APP_ID,
    api_version: process.env.FACEBOOK_API_VERSION || 'v2.2',
    app_access_token: process.env.FACEBOOK_APP_ACCESS_TOKEN
}

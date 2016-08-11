/* eslint-disable no-process-env */
module.exports = {
    secret: process.env.AUTH_TOKEN_SECRET || 'randomaccess',
    expires_in_seconds: 31557600
}

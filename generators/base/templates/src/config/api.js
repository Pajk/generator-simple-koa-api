/* eslint-disable no-process-env */
module.exports = {
    name: 'API',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    development: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    debugRequest: process.env.DEBUG_REQUEST === 'true',
    pagination: {
        max_per_page: 20
    }
}

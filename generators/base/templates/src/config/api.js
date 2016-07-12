'use strict'

module.exports = {
    name: 'New API',
    port: process.env.PORT || 3000,
    body: {
        multipart: true
    },
    normalize_path: function(path) {
        return path
            .replace(/\/password_reset\/.+/g, '/password_reset/:token')
            .replace(/\/verify-email\/.+/g, '/verify-email/:token')
            .replace(/\/verify-phone\/.+/g, '/verify-phone/:token')
            .replace(/\d+/g, ':id')
    },
    public_routes: {
        POST: [
            '/users',
            '/session'
        ],
        GET: [
            '/users'
        ],
        OPTIONS: [
            '/session'
        ]
    },
    pagination: {
        max_per_page: 20
    }
}

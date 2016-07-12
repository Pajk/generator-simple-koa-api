const jwt = require('jsonwebtoken')
const config = require('../config/auth')

const ALGORITHM = 'HS256'

const helper = {}

helper.create = function (claims, expires_in = config.expires_in_seconds) {
    return new Promise(function(resolve, reject) {
        jwt.sign(claims, config.secret, {
            expiresIn: expires_in,
            algorithm: ALGORITHM
        }, function(err, token) {
            if (err) return reject(err)
            resolve(token)
        })
    })
}

helper.verify = function (token) {
    if (typeof token !== 'string') {
        throw new Error('Invalid token')
    }

    return new Promise(function(resolve, reject) {
        jwt.verify(token, config.secret, {
            complete: true,
            algorithms: [ALGORITHM]
        }, function(err, token) {
            if (err) return reject(err)
            resolve(token)
        })
    })
}

module.exports = helper

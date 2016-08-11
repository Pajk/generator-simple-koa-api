const jwt = require('jsonwebtoken')
const config = require('../config/auth')

const ALGORITHM = 'HS256'
const VERIFY_OPTIONS = {
    complete: true,
    algorithms: [ALGORITHM]
}

module.exports = {
    create (claims, expiresIn) {
        const options = {
            expiresIn: expiresIn || config.expires_in_seconds,
            algorithm: ALGORITHM
        }

        return new Promise((resolve, reject) => {
            const handler = (err, token) => err ? reject(err) : resolve(token)

            jwt.sign(claims, config.secret, options, handler)
        })
    },

    verify (token) {
        if (typeof token !== 'string') {
            throw new Error('Invalid token')
        }

        return new Promise((resolve, reject) => {
            const handler = (err, decodedToken) => err ? reject(err) : resolve(decodedToken)

            jwt.verify(token, config.secret, VERIFY_OPTIONS, handler)
        })
    }
}

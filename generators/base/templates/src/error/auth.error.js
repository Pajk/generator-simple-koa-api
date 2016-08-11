const util = require('util')
const i18n = require('../config/msg')

module.exports = function authError () {
    this.status = 401
    this.type = 'AuthError'
    this.message = i18n.auth_error
}

util.inherits(module.exports, Error)

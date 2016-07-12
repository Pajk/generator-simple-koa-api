'use strict'

const _ = require('lodash')
const logger = require('../helper/logger')

module.exports = function* (next) {
    const debug = /debug/.test(this.request.querystring)
    if (debug) {

        logger.log('path', this.request.path)
        logger.log('query', this.request.querystring)
        logger.log('body', JSON.stringify(this.request.body))
        logger.log('headers', JSON.stringify(this.request.headers))

        if (this.request.body) {
            logger.log('multipart fields', JSON.stringify(this.request.body.fields))
            logger.log('multipart files keys', this.request.body.files ? _.keys(this.request.body.files) : null)
            logger.log('multipart files', JSON.stringify(this.request.body.files))
        }

    }

    yield next

    if (debug) {
        logger.log('status', this.status)
        logger.log('response', JSON.stringify(this.body))
    }
}

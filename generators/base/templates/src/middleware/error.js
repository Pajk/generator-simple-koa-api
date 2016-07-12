'use strict'

const _ = require('lodash')
const logger = require('../helper/logger')

module.exports = function* catchErrors(next) {
    try {
        yield next
    } catch (err) {
        const body = {}

        body.status = err.status || 500
        body.title = err.title
        body.message = err.message || this.message

        if (err.type == 'invalid_request') {
            body.validation_messages = err.validation_messages
        }

        this.type = 'json'
        this.body = body
        this.status = body.status
        //console.log(err.stack)

        if (this.status > 403 && err) {
            const log = _.cloneDeep(body)

            Object.assign(log, err)

            if (!log.user_id && this.state.current_user) {
                log.user_id = this.state.current_user.user_id
            }

            if (err.stack) {
                const match = err.stack.match(/.*\/src\/.*/g)
                if (match) {
                    log.context = match.join('')
                }
            }

            logger.error(log)
        }
    }
}

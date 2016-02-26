var _ = require('lodash')

var errorHelperFactory = function (logger) {

  var helper = {}

  helper.catchErrors = function* (next) {
    try {
      yield next
    } catch (err) {
      var body = {}

      body.status = err.status || 500
      body.title = err.title
      body.message = err.message || this.message

      if (err.name == 'ValidatorException') {
        body.validation_messages = err.validation_messages
      }

      this.type = 'json'
      this.body = body
      this.status = body.status

      if (this.status >= 400 && err) {
        var log = _.clone(body, true)

        if (err.stack) {
          var match = err.stack.match(/.*\/src\/.*/g)
          if (match) {
            log.context = match.join('')
          }
        }

        //logger.error(log)
      }
    }
  }

  helper.debugMode = function* (next) {
    var debug = /debug/.test(this.request.querystring)
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

  return helper
}

// @autoinject
module.exports.error_helper = errorHelperFactory

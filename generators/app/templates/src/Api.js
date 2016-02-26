'use strict'

const koa = require('koa')
const route = require('koa-route')
const koabody = require('koa-body')
const koalogger = require('koa-logger')
const compress = require('koa-compress')

var app = koa()

var apiFactory = function (auth, error_helper, pagination, config, logger,
  user_controller, session_controller) {

  var setupMiddlewares = function () {

    app.use(compress())
    app.use(error_helper.catchErrors)

    if (process.env.NODE_ENV != 'test') {
      app.use(koalogger())
    }

    app.use(koabody(config.koa.body))
    app.use(error_helper.debugMode)
    app.use(auth.authenticate)
    app.use(pagination.extract)

  }

  var setupRoutes = function () {
    app.use(route.post('/users', user_controller.create))
    app.use(route.get('/users', user_controller.getList))
    app.use(route.get('/users/:user_id', user_controller.getOne))

    app.use(route.post('/session', session_controller.create))
    app.use(route.del('/session', session_controller.delete))
  }

  setupMiddlewares()
  setupRoutes()

  var api = {}

  api.start = function* () {

    var port = process.env.PORT || config.koa.port
    logger.info(config.koa.name, 'listening @', port, ' [', process.env.NODE_ENV || 'development', ']')
    return app.listen(port)

  }

  api.app = app

  return api
}

// @autoinject
module.exports.api = apiFactory

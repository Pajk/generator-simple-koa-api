'use strict'

require('dotenv').load({ silent: true })
global.Promise = require('bluebird')

const compress = require('koa-compress')
const koalogger = require('koa-logger')
const koabody = require('koa-body')
const koa = require('koa')

const pagination_middleware = require('./middleware/pagination')
const debug_middleware = require('./middleware/debug')
const error_middleware = require('./middleware/error')
const auth_middleware = require('./middleware/auth')
const logger = require('./helper/logger')
const setupRoutes = require('./route')
const config = require('./config')

const app = koa()

const setupMiddlewares = function () {
    app.use(compress())
    app.use(error_middleware)

    if (process.env.NODE_ENV != 'test') {
        app.use(koalogger())
    }

    app.use(koabody(config.api.body))
    app.use(debug_middleware)
    app.use(auth_middleware)
    app.use(pagination_middleware)
}

setupMiddlewares()
setupRoutes(app)

const api = {}

api.start = function () {
    const port = config.api.port
    logger.info(config.api.name, 'listening @', port, ' [', process.env.NODE_ENV || 'development', ']')
    return app.listen(port)
}

api.app = app

module.exports = api

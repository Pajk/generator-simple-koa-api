require('dotenv').load({ silent: true })
global.Promise = require('bluebird')

const compress = require('koa-compress')
const koalogger = require('koa-logger')
const convert = require('koa-convert')
const koabody = require('koa-body')
const Koa = require('koa')

const paginationMiddleware = require('./middleware/pagination')
const debugMiddleware = require('./middleware/debug')
const errorMiddleware = require('./middleware/error')
const logMiddleware = require('./middleware/logger')
const log = require('./helper/logger')
const setupRoutes = require('./routes')
const config = require('./config')

const app = new Koa()

app.use(compress())
app.use(errorMiddleware())

if (process.env.NODE_ENV == 'development') {
    app.use(koalogger())
}

app.use(convert(koabody(config.api.body)))
app.use(logMiddleware())
app.use(debugMiddleware(process.env.DEBUG_REQUEST == 'true'))
app.use(paginationMiddleware())

setupRoutes(app)

const api = {}

api.start = function () {
    const port = config.api.port
    log.info(config.api.name, 'listening @', port, ' [', process.env.NODE_ENV || 'development', ']')
    return app.listen(port)
}

api.app = app

module.exports = api

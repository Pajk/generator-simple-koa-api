require('dotenv').load({ silent: true })
global.Promise = require('bluebird')

const compress = require('koa-compress')
const koalogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const koaStatic = require('koa-static')
const Koa = require('koa')

const paginationMiddleware = require('./middleware/pagination')
const debugMiddleware = require('./middleware/debug')
const errorMiddleware = require('./middleware/error')
const logMiddleware = require('./middleware/logger')
const log = require('./helper/logger')
const config = require('./config/api')

const app = new Koa()

app.use(compress())
app.use(errorMiddleware())

if (process.env.NODE_ENV == 'development') {
    app.use(koalogger())
}

app.use(bodyParser())

app.use(logMiddleware())
app.use(debugMiddleware(process.env.DEBUG_REQUEST == 'true'))
app.use(paginationMiddleware())

app.use(koaStatic(__dirname + '/../public'))

require('./resource/user').init(app)
require('./resource/facebook').init(app)
require('./resource/session').init(app)
require('./resource/profile').init(app)

const api = {}

api.start = function () {
    // trust proxy
    app.proxy = true

    const port = config.port
    log.info(config.name, 'listening @', port, ' [', process.env.NODE_ENV || 'development', ']')
    return app.listen(port)
}

api.app = app

module.exports = api

require('dotenv').load({ silent: true })
global.Promise = require('bluebird')

const compress = require('koa-compress')
const koalogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const koaStatic = require('koa-static')
const Koa = require('koa')
const path = require('path')

const paginationMiddleware = require('./middleware/pagination')
const debugMiddleware = require('./middleware/debug')
const errorMiddleware = require('./middleware/error')
const logMiddleware = require('./middleware/logger')
const log = require('./helper/logger')
const config = require('./config/api')

const app = new Koa()

// trust proxy
app.proxy = true

app.use(compress())
app.use(errorMiddleware())

if (config.development) {
    app.use(koalogger())
}

app.use(bodyParser())

app.use(logMiddleware())
app.use(debugMiddleware(config.debugRequest))
app.use(paginationMiddleware())

app.use(koaStatic(path.join(__dirname, '../public')))

require('./resource/user').init(app)
require('./resource/facebook').init(app)
require('./resource/session').init(app)
require('./resource/profile').init(app)


module.exports = {
    start () {
        log.info(config.name, 'listening @', config.port, ' [', config.environment, ']')
        return app.listen(config.port)
    },

    app
}

'use strict'

const route = require('koa-route')

const sessionController = require('../controller/session')

module.exports = function (app) {
    app.use(route.post('/session', sessionController.create))
    app.use(route.del('/session', sessionController.delete))
}

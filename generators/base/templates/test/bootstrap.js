/* eslint-disable no-undef, arrow-parens, no-console, global-require */

before(() => {
    global.Promise = require('bluebird')
    Promise.onPossiblyUnhandledRejection(() => {
        // maybe good for debuggin purposes, but it fires everytime
        // a promise is rejected eg. in controller and it's not immediately catched
        // even though it is catched higher in the stack by error middleware
        // console.log('Rejected Promise: ', err.message)
    })

    const supertest = require('supertest-as-promised')
    // const testRunner = require('bandage-runner')
    const sinon = require('sinon')
    const assert = require('assert')

    const hashHelper = require('../src/helper/hash')
    const testHelper = require('./helper')
    const api = require('../src/api')

    // stub password hashing
    sinon.stub(hashHelper, 'get', pass => Promise.resolve(pass))
    sinon.stub(hashHelper, 'verify', (stored, pass) => Promise.resolve(pass === stored))

    api.app.on('error', console.log)

    global.request = supertest(api.app.callback())
    global.helper = testHelper(global.request)
    global.assert = assert
})

after(() => {
    console.log('AFTER')
    const sequelize = require('../src/model').sequelize
    const db = require('../src/helper/db')

    db.disconnect()
    sequelize.close()
})

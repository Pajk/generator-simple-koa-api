'use strict'

require('dotenv').load({ path: '.env-test', silent: true })

global.Promise = require('bluebird')
const supertest = require('co-supertest')
const testRunner = require('bandage-runner')
const testHelper = require('./test/helper')

const api = require('./src/api')
const db = require('./src/helper/db')

api.app.on('error', console.log)

const request = supertest(api.app.callback())
const helper = testHelper(request)

const file = process.argv[2]
if (file) {
    console.log('Test file: ', file)
}

const testParams = [request, helper]

testRunner(testParams, file, db.disconnect)

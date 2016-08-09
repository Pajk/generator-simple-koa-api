require('dotenv').load({ path: '.env-test', silent: true })

require('babel-core/register')({
    presets: ['es2015-node6', 'stage-3']
})

global.Promise = require('bluebird')
const supertest = require('co-supertest')
const testRunner = require('bandage-runner')
const sinon = require('sinon')

const testHelper = require('./test/helper')
const hashHelper = require('./src/helper/hash')

// stub password hashing
sinon.stub(hashHelper, 'get', (pass) => Promise.resolve(pass))
sinon.stub(hashHelper, 'verify', (stored, pass) => Promise.resolve(pass == stored))

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

testRunner(testParams, file, () => {
    db.disconnect()
    require('./src/model').sequelize.close()
})

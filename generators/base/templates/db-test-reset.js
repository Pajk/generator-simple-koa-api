'use strict'

require('dotenv').config({path: '.env-test', silent: true})

const dbMigrate = require('db-migrator/lib/migrate')
const dbRollback = require('db-migrator/lib/rollback')

const co = require('co')

const exitWithError = function() {
    process.exit(1)
}

co(function *() {

    yield dbRollback({
        connectionString: process.env.PG_URL,
        targetVersion: 'initial',
        path: './migrations',
        tableName: 'migrations'
    }).catch(exitWithError)

    yield dbMigrate({
        connectionString: process.env.PG_URL,
        path: './migrations',
        tableName: 'migrations'
    }).catch(exitWithError)

}).then(process.exit).catch(exitWithError)

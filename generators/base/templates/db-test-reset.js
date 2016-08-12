'use strict'
/* eslint-disable no-process-env, no-console, no-process-exit */

require('dotenv').config({ path: '.env-test', silent: true })

const dbMigrate = require('db-migrator/lib/migrate')
const dbRollback = require('db-migrator/lib/rollback')

dbRollback({
    connectionString: process.env.PG_URL,
    targetVersion: 'initial',
    path: './migrations',
    tableName: 'migrations'
})
.then(() =>
    dbMigrate({
        connectionString: process.env.PG_URL,
        path: './migrations',
        tableName: 'migrations'
    })
)
.then(() => process.exit(0))
.catch(() => process.exit(1))

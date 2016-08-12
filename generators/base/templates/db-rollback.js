'use strict'
/* eslint-disable no-process-env, no-console, no-process-exit */

require('dotenv').load({ path: '.env' })

const rollback = require('db-migrator/lib/rollback')
const dotenv = require('dotenv')
const path = require('path')

const env = process.argv[2] || 'local'

let envFile

switch (env) {
    case 'staging':
        envFile = '.env-heroku-staging'
        break
    case 'production':
        envFile = '.env-heroku-production'
        break
    case 'dev':
        envFile = '.env-heroku-dev'
        break
    default:
        envFile = '.env'
}

dotenv.config({
    silent: true,
    path: path.join(__dirname, envFile)
})

const DB_URL = process.env.PG_URL || process.env.DATABASE_URL

if (!DB_URL) {
    throw new Error('DB connection string not defined.')
}

rollback({
    connectionString: DB_URL,
    targetVersion: '-1',
    path: './migrations',
    tableName: 'migrations'
})
.then(() => process.exit(0))
.catch(() => process.exit(1))

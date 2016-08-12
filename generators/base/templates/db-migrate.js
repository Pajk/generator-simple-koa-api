'use strict'
/* eslint-disable no-process-env, no-console, no-process-exit */
const migrate = require('db-migrator/lib/migrate')
const status = require('db-migrator/lib/status')
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

status({
    connectionString: DB_URL,
    path: './migrations',
    tableName: 'migrations'
})
.then(() =>
    migrate({
        connectionString: DB_URL,
        path: './migrations',
        tableName: 'migrations'
    })
)
.then(() => console.log(envFile, 'migrated'))
.then(() => process.exit(0))
.catch(() => process.exit(1))

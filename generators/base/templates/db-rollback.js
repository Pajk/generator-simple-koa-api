'use strict'

require('dotenv').load({ path: '.env' })

const rollback = require('db-migrator/lib/rollback')
const dotenv = require('dotenv')

const env = process.argv[2] || 'local'

let envFile

switch (env) {
case 'staging':
    envFile = '.env-heroku-staging'; break
case 'production':
    envFile = '.env-heroku-production'; break
case 'dev':
    envFile = '.env-heroku-dev'; break
default:
    envFile = '.env'
}

dotenv.config({
    silent: true,
    path: __dirname + '/' + envFile
})

const DB_URL = process.env.PG_URL || process.env.DATABASE_URL
if (!DB_URL) {
    console.error('DB connection string not defined.')
    process.exit(1)
}

rollback({
    connectionString: DB_URL,
    targetVersion: '-1',
    path: './migrations',
    tableName: 'migrations'
}).then(function() {
    process.exit(0)
}).catch(function() {
    process.exit(1)
})

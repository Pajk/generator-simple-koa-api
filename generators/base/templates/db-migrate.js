'use strict'

const migrate = require('db-migrator/lib/migrate')
const status = require('db-migrator/lib/status')
const dotenv = require('dotenv')
const co = require('co')

const env = process.argv[2] || 'local'

let envFile

switch(env) {
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

co(function* () {
    yield status({
        connectionString: DB_URL,
        path: './migrations',
        tableName: 'migrations'
    })
    yield migrate({
        connectionString: DB_URL,
        path: './migrations',
        tableName: 'migrations'
    })
    console.log(envFile, 'migrated')
    process.exit(0)
}).catch(function() {
    process.exit(1)
})

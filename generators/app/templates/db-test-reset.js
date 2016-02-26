#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

require('dotenv').config({path: '.env-test', silent: true})

var dbMigrate = require('db-migrator/lib/migrate')
var dbRollback = require('db-migrator/lib/rollback')

var co = require('co')

var exitWithError = function() {
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

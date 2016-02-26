#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

require('dotenv').load({path: '.env'})
//require('dotenv').load({path: '.env-heroku-dev'})
//require('dotenv').load({path: '.env-heroku-staging'})
//require('dotenv').load({path: '.env-heroku-production'})

var rollback = require('db-migrator/lib/rollback')

rollback({
  connectionString: process.env.PG_URL,
  targetVersion: '-1',
  path: './migrations',
  tableName: 'migrations'
}).then(function() {
  process.exit(0)
}).catch(function() {
  process.exit(1)
})

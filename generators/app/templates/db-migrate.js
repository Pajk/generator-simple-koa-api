#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

var migrate = require('db-migrator/lib/migrate')
var parallel = require('co-parallel')
var dotenv = require('dotenv')
var co = require('co')
var fs = require('fs')

var env = process.argv[2] || 'local'

var envs

switch(env) {
case 'staging':
  envs = ['.env-heroku-staging']; break
case 'production':
  envs = ['.env-heroku-production']; break
case 'dev':
  envs = ['.env-heroku-dev']; break
default:
  envs = ['.env']
}

var migrateEnv = function* (env) {

  var file = fs.readFileSync(__dirname + '/' + env)
  var config = dotenv.parse(file)

  yield migrate({connectionString: config.PG_URL, path: './migrations', tableName: 'migrations'})

  console.log(env, 'migrated')
}

co(function* () {

  var jobs = envs.map(migrateEnv)

  yield parallel(jobs, 1)

  process.exit(0)
}).catch(function() {
  process.exit(1)
})


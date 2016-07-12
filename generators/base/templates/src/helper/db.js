const _ = require('lodash')
const pg = require('pg')
const copg = require('co-pg')(pg)
const buildQuery = require('simple-builder').pg
const Promise = require('bluebird')

const config = require('../config/db')

copg.defaults.poolSize = config.pool_size
copg.defaults.poolIdleTimeout = config.pool_timeout

const helper = {}

helper.disconnect = function() {
    copg.end()
}

helper.getConnection = Promise.coroutine(function* () {
    return yield copg.connectPromise(config.connection_string || config)
})

helper.query = Promise.coroutine(function* (query, unescaped_values, connection) {
    if (query && query.constructor === Array && !unescaped_values) {
        const built = helper.build(query)
        query = built.text
        unescaped_values = built.values
    }

    if (connection) {
        const result = yield connection.queryPromise(query, unescaped_values)
        return result.rows
    }

    let returnToPool
    try {
        const connection_results = yield helper.getConnection()
        connection = connection_results[0]
        returnToPool = connection_results[1]
        const result = yield connection.queryPromise(query, unescaped_values)

        return result.rows
    } catch (e) {
        throw e
    } finally {
        if (returnToPool) {
            returnToPool()
        }
    }
})

helper.createClient = function() {
    return new copg.Client(config)
}

helper.build = buildQuery

helper.filterFields = function(keys, data) {
    return Object.keys(data).reduce(function(filtered, current) {

        if (_.includes(keys, current)) {
            filtered[current] = data[current]
        }
        return filtered
    }, {})
}

helper.formatDate = function(date) {
    return date.toISOString()
}

helper.DESC = false
helper.ASC = true

helper.withTransaction = Promise.coroutine(function* (runner) {
    const [client, done] = yield helper.getConnection()

    function* rollback (err) {
        try {
            yield client.queryPromise('ROLLBACK')
        } catch (err) {
            console.error('[INTERNAL_ERROR] Could not rollback transaction, removing from pool', err)
            done(err)
            throw err
        }
        done()

        throw err
    }

    try {
        yield client.queryPromise('BEGIN')
    } catch (err) {
        console.error('[INTERNAL_ERROR] There was an error calling BEGIN', err)
        return yield* rollback(err)
    }

    let result
    try {
        result = yield* runner(client)
    } catch (err) {
        return yield* rollback(err)
    }

    try {
        yield client.queryPromise('COMMIT')
    } catch (err) {
        return yield* rollback(err)
    }
    done()

    return result
})

module.exports = helper

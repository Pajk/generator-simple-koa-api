const _ = require('lodash')
const pg = require('pg')
const buildQuery = require('simple-builder').pg

const config = require('../config/db')

const pool = new pg.Pool({
    connectionString: config.connection_string,
    min: config.pool_size_min,
    max: config.pool_size_max,
    idleTimeoutMillis: config.pool_timeout
})

const helper = {}

helper.disconnect = function() {
    pool.end().catch(console.error)
}

helper.getClient = function() {
    return pool.connect()
}

// pg query doesn't throw the original exception when the catch is not used
// not sure what is causing this
const rethrow = function (err) {
    throw err
}

helper.query = async function (query, unescaped_values, client) {

    if (query && query.constructor === Array && !unescaped_values) {
        const built = helper.build(query)
        query = built.text
        unescaped_values = built.values
    }

    const result = client
        ? await client.query(query, unescaped_values).catch(rethrow)
        : await pool.query(query, unescaped_values).catch(rethrow)

    return result.rows
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

helper.withTransaction = async function (runner) {
    const client = await pool.connect()

    const rollback = async function (err) {
        try {
            await client.query('ROLLBACK').catch(rethrow)
        } catch (err) {
            console.error('[INTERNAL_ERROR] Could not rollback transaction, removing from pool', err)
            client.release(err)
            throw err
        }
        client.release()

        throw err
    }

    try {
        await client.query('BEGIN').catch(rethrow)
    } catch (err) {
        console.error('[INTERNAL_ERROR] There was an error calling BEGIN', err)
        return await rollback(err)
    }

    let result
    try {
        result = await runner(client)
    } catch (err) {
        return await rollback(err)
    }

    try {
        await client.query('COMMIT').catch(rethrow)
    } catch (err) {
        return await rollback(err)
    }
    client.release()

    return result
}

module.exports = helper

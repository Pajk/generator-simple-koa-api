const _ = require('lodash')
const pg = require('pg')
const buildQuery = require('simple-builder').pg
const log = require('./logger')

const config = require('../config/db')

const pool = new pg.Pool({
    connectionString: config.connection_string,
    min: config.pool_size_min,
    max: config.pool_size_max,
    idleTimeoutMillis: config.pool_timeout
})

/**
 * pg query doesn't throw the original exception when the catch is not used
 * not sure what is causing this
 * @param  {Error} err Error to throw
 * @return {undefined}
 */
function rethrow (err) {
    throw err
}

module.exports = {
    disconnect () {
        pool.end().catch(log.error)
    },

    getClient () {
        return pool.connect()
    },

    async query (query, values, client) {
        if (query && query.constructor === Array && !values) {
            const built = buildQuery(query)

            query = built.text
            values = built.values
            log.trace({ query, values }, 'QUERY')
        }

        const result = client
            ? await client.query(query, values).catch(rethrow)
            : await pool.query(query, values).catch(rethrow)

        return result.rows
    },

    build: buildQuery,

    filterFields (keys, data) {
        return Object.keys(data).reduce((filtered, current) => {
            if (_.includes(keys, current)) {
                filtered[current] = data[current]
            }
            return filtered
        }, {})
    },

    formatDate (date) {
        return date.toISOString()
    },

    DESC: false,
    ASC: true,

    async withTransaction (runner) {
        const client = await pool.connect()

        /**
         * Rollback the transaction
         * @param  {Error} err Error caused the rollback
         * @return {undefined}
         */
        async function rollback (err) {
            try {
                await client.query('ROLLBACK').catch(rethrow)
            } catch (error) {
                log.error(err, 'Could not rollback transaction, removing from pool')
                client.release(error)
                throw error
            }
            client.release()

            throw err
        }

        try {
            await client.query('BEGIN').catch(rethrow)
        } catch (err) {
            log.error(err, 'There was an error calling BEGIN')
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
}

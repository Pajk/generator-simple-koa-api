/* eslint-disable no-process-env */
module.exports = {
    connection_string: process.env.PG_URL || process.env.DATABASE_URL,
    pool_size_max: process.env.PG_POOL_SIZE_MAX || 8,
    pool_size_min: process.env.PG_POOL_SIZE_MIN || 2,
    pool_timeout: process.env.PG_POOL_TIMEOUT || 30000
}

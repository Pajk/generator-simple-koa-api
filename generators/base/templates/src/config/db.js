'use strict'

module.exports = {
    url: process.env.PG_URL || process.env.DATABASE_URL,
    pool_size: process.env.PG_POOL_SIZE || 8,
    pool_timeout: process.env.PG_POOL_TIMEOUT || 30000
}

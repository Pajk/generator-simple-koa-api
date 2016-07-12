'use strict'

const config = require('../config/api')

module.exports = function* extract (next) {
    const limit = parseInt(this.query.limit) || config.pagination.max_per_page
    const page = parseInt(this.query.page) || 1
    const offset = parseInt(this.query.offset) || (page - 1) * limit || 0
    const timestamp_offset = parseInt(this.query.timestamp_offset)

    this.state = this.state || {}

    this.state.pagination = {
        limit: limit,
        offset: offset,
        timestamp_offset: timestamp_offset
    }

    yield next
}

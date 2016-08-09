const qs = require('querystring')

const helper = {}

helper.getQueryParts = function (pagination) {
    const queryParts = { conditions: [], limit: [] }
    if (!pagination) {
        return queryParts
    }

    if (pagination.limit) {
        queryParts.limit.push('LIMIT ?')
        queryParts.limit.push(pagination.limit)
    }

    if (pagination.offset) {
        queryParts.limit.push('OFFSET ?')
        queryParts.limit.push(pagination.offset)
    }

    return queryParts
}

const constructPageLink = function (pathname, query, pagination) {
    return pathname + '?' + qs.stringify(Object.assign({}, query, pagination))
}

helper.formatResults = function (data, pathname, query, {limit, offset, page } = {}) {
    delete query.offset
    delete query.timestamp_offset

    const output = {}

    if (limit && data.length == limit) {
        if (page) {
            output.next_page = constructPageLink(pathname, query, { limit, page: page + 1 })
        } else {
            output.next_page = constructPageLink(pathname, query, { limit, offset: limit + offset })

            const timestampOffset = data[ data.length - 1 ].created_at.getTime()
            output.next_page_timestamp = constructPageLink(pathname, query, { limit, timestampOffset })
        }
    }

    output.data = data
    output.count = data.length

    return output
}

module.exports = helper

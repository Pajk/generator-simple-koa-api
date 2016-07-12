const qs = require('querystring')

const helper = {}

const constructPageLink = function(pathname, query, pagination) {
    return pathname + '?' + qs.stringify(Object.assign({}, query, pagination))
}

helper.format = function (data, pathname, query, {limit, offset, page } = {}) {
    delete query.offset
    delete query.timestamp_offset

    const output = {}

    if (limit && data.length == limit) {
        if (page) {
            output.next_page = constructPageLink(pathname, query, { limit, page: page + 1 })
        } else {
            output.next_page = constructPageLink(pathname, query, { limit, offset: limit + offset })

            const timestamp_offset = data[ data.length - 1 ].created_at.getTime()
            output.next_page_timestamp = constructPageLink(pathname, query, { limit, timestamp_offset })
        }
    }

    output.data = data
    output.count = data.length

    return output
}


module.exports = helper

const qs = require('querystring')

/**
 * @param  {string} pathname url path
 * @param  {object} query get parameters
 * @param  {object} pagination pagination get parameters
 * @return {string}
 */
function constructPageLink (pathname, query, pagination) {
    return `${pathname}?${qs.stringify(Object.assign({}, query, pagination))}`
}

module.exports = {

    getQueryParts (pagination) {
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
    },

    formatResults (data, pathname, query, pagination) {
        const { limit, offset, page } = pagination || {}

        delete query.offset
        delete query.timestamp_offset

        const output = {}

        if (limit && data.length === limit) {
            if (page) {
                output.next_page = constructPageLink(pathname, query, { limit, page: page + 1 })
            } else {
                const npOpts = { limit, offset: limit + offset }

                output.next_page = constructPageLink(pathname, query, npOpts)

                const timestampOffset = data[data.length - 1].created_at.getTime()

                const nptOpts = { limit, timestampOffset }

                output.next_page_timestamp = constructPageLink(pathname, query, nptOpts)
            }
        }

        output.data = data
        output.count = data.length

        return output
    }
}

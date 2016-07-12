'use strict'

const helper = {}

helper.format = function (data, pathname, pagination) {
    const limit = pagination.limit
    const offset = pagination.offset

    const output = {}

    if (data.length == limit) {

        const date_offset = data.length ? data[ data.length - 1 ].created_at : undefined

        const parts = pathname.split('?')

        const url_params = [
            (date_offset && !pagination.force_offset) ? ( 'timestamp_offset=' + date_offset.getTime() ) : ( 'offset=' + (limit + offset) ),
            'limit=' + limit
        ]

        if (parts[1] != undefined) {
            const queries = parts[1].split('&')
            url_params.push(queries.filter(function (s) { return s.match(/gender=/) != null ? true : false }).pop())
        }

        // remove older queries from pathname
        output.next_page = parts[0] + '?' + url_params.join('&')
    }

    output.data = data
    output.count = data.length

    return output
}

module.exports = helper

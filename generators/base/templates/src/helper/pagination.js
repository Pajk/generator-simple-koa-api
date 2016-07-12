
const helper = {}

helper.getQueryParts = function (pagination) {
    const query_parts = { conditions: [], limit: [] }
    if (!pagination) {
        return query_parts
    }

    if (pagination.limit) {
        query_parts.limit.push('LIMIT ?')
        query_parts.limit.push(pagination.limit)
    }

    if (pagination.offset) {
        query_parts.limit.push('OFFSET ?')
        query_parts.limit.push(pagination.offset)
    }

    return query_parts
}

module.exports = helper

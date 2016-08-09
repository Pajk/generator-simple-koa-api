module.exports = function () {
    return async (ctx, next) => {
        const limit = parseInt(ctx.query.limit) || 0
        const page = parseInt(ctx.query.page) || 1
        const offset = parseInt(ctx.query.offset) || (page - 1) * limit || 0
        const timestampOffset = parseInt(ctx.query.timestamp_offset)

        ctx.state = ctx.state || {}

        ctx.state.pagination = { limit, offset, timestamp_offset: timestampOffset, page }

        await next()
    }
}

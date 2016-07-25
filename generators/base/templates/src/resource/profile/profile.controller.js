module.exports = {

    async get (ctx) {
        ctx.body = {
            user: ctx.state.current_user
        }
        ctx.status = 200
    }
}

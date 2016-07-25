const koaSend = require('koa-send')

const msg = require('../../config/msg')
const userValidator = require('./user.validator')

module.exports = {

    async create (ctx) {
        userValidator.validate(ctx.request.body, msg.signup_error)

        const user_id = await ctx.app.user.create(ctx.request.body)
        const session_token = await ctx.app.session.create(user_id)

        ctx.status = 201
        ctx.body = {
            id: user_id,
            token: session_token
        }
    },

    async renderCreate (ctx) {
        await koaSend(ctx, 'user.create.html', { root: __dirname })
    },

    async uploadAvatar (ctx) {
        const name = 'file'
        console.log(ctx.request.body.files)

        if (!ctx.request.body.files || !ctx.request.body.files[name]) {
            ctx.throw(422, 'File to upload not provided')
        }

        const file = ctx.request.body.files[name]
        ctx.log.info(file, 'file uploaded')

        ctx.body = {
            url: file.url
        }
    }
}

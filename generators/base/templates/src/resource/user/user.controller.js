const koaSend = require('koa-send')

const msg = require('../../config/msg')
const validate = require('./user.validator')
const userService = require('./user.service')
const sessionService = require('../session/session.service')

module.exports = {

    async create (ctx) {
        const body = validate(ctx.request.body, {
            message: msg.signup_error,
            context: {
                ip: ctx.ip
            }
        })

        const userId = await userService.create(body)
        const sessionToken = await sessionService.create(userId)

        ctx.status = 201
        ctx.body = {
            id: userId,
            token: sessionToken
        }
    },

    async renderCreate (ctx) {
        await koaSend(ctx, 'user.create.html', { root: __dirname })
    },

    async uploadAvatar (ctx) {
        const fieldName = 'file'

        if (!ctx.request.body.files || !ctx.request.body.files[fieldName]) {
            ctx.throw(422, 'File to upload not provided')
        }

        const file = ctx.request.body.files[fieldName]
        ctx.log.info(file, 'file uploaded')

        ctx.body = {
            url: file.url
        }
    }
}

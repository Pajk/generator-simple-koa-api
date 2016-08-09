const msg = require('../../config/msg')
const validate = require('./profile.validator')
const profileService = require('./profile.service')

module.exports = {

    async get (ctx) {
        ctx.body = await profileService.get(ctx.state.user.id)
    },

    async update (ctx) {
        const data = validate(ctx.request.body, {
            message: msg.profile.update_error,
            context: {
                address_id: ctx.state.user.address_id
            }
        })

        await profileService.update(ctx.state.user.id, data)

        ctx.body = await profileService.get(ctx.state.user.id)
    }
}

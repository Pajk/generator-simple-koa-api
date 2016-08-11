const userData = require('../user/user.data')
const addressData = require('../address/address.data')

module.exports = {

    async get (userId) {
        return await userData.findUser({ id: userId }, {
            include: ['address']
        })
    },

    async update (userId, data) {
        if (data.address) {
            data.address_id = data.address_id
                ? await addressData.updateAddress(data.address_id, userId, data.address)
                : await addressData.createAddress(userId, data.address)
            delete data.address
        }

        await userData.updateUser(userId, data)
    }
}

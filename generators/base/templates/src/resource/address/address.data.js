const { Address } = require('../../model')

module.exports = {

    async createAddress (userId, data) {
        data.user_id = userId
        const address = await Address.create(data)

        return address.id
    },

    async updateAddress (addressId, userId, data) {
        return await Address.update(data, {
            where: {
                id: addressId,
                user_id: userId
            }
        }).spread(updated => updated === 1 ? addressId : null)
    },

    async getAddress (id) {
        return await Address.findOne(id)
    }
}

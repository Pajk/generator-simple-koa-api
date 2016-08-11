const { User, Address, Session, sequelize } = require('../../model')

const includes = {
    address: {
        model: Address,
        attributes: {
            exclude: ['created_at', 'deleted_at', 'id', 'updated_at', 'user_id']
        }
    }
}

module.exports = {

    async createUser (data) {
        const newUser = await User.create(data)

        return newUser.id
    },

    async updateUser (userId, data) {
        return await User.update(data, { where: { id: userId } })
    },

    async findUser (where, options = {}) {
        options.where = where

        if (options.include) {
            options.include = options.include.map(key => {
                if (includes.hasOwnProperty(key)) {
                    return includes[key]
                }
                return key
            })
        }

        return await User.findOne(options)
    },

    async findUserByToken (token) {
        return await User.findOne({
            attributes: User.attributes,
            include: [{
                model: Session,
                where: { token }
            }]
        })
    },

    async findUserByEmail (email) {
        return await User.findOne({
            where: sequelize.where(
                sequelize.fn('lower', sequelize.col('email')),
                email.toLowerCase()
            )
        })
    }
}

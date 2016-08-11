const msg = require('../config/msg')

module.exports = function userModelInit (sequelize, TYPE) {
    const User = sequelize.define('user', {

        first_name: TYPE.STRING,

        last_name: TYPE.STRING,

        email: {
            type: TYPE.STRING,
            unique: {
                msg: msg.email_already_registered
            }
        },

        password: TYPE.STRING,

        address_id: TYPE.INTEGER,

        avatar_url: TYPE.STRING,

        last_login: {
            type: TYPE.DATE,
            defaultValue: () => new Date(),
            field: 'login_at'
        },

        reg_ip: TYPE.STRING

    }, {
        classMethods: {

            associate: models => {
                User.belongsTo(models.Address)
                User.hasMany(models.Session)
            },

            moduleName: 'User'
        }
    })

    return User
}

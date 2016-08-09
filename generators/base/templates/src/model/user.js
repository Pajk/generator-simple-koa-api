const msg = require('../config/msg')

module.exports = function (sequelize, T) {

    const User = sequelize.define('user', {
        first_name  : T.STRING,
        last_name   : T.STRING,
        email: {
            type    : T.STRING,
            unique  : {
                msg: msg.email_already_registered
            }
        },
        password    : T.STRING,
        address_id  : T.INTEGER,
        avatar_url  : T.STRING,
        last_login: {
            type    : T.DATE,
            defaultValue: () => new Date(),
            field   : 'login_at'
        },
        reg_ip      : T.STRING
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

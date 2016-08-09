module.exports = function (sequelize, T) {

    const Address = sequelize.define('address', {
        line1       : T.STRING,
        line2       : T.STRING,
        user_id     : T.INTEGER,
        zip         : T.STRING,
        city        : T.STRING,
        country     : T.STRING,
        state       : T.STRING
    }, {
        classMethods: {
            associate: models => {
                Address.belongsTo(models.User)
            },
            moduleName: 'Address'
        }
    })

    return Address
}
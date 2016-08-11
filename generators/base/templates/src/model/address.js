module.exports = function addressModelInit (sequelize, TYPE) {
    const Address = sequelize.define('address', {

        line1: TYPE.STRING,

        line2: TYPE.STRING,

        user_id: TYPE.INTEGER,

        zip: TYPE.STRING,

        city: TYPE.STRING,

        country: TYPE.STRING,

        state: TYPE.STRING

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

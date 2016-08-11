module.exports = function facebookModelInit (sequelize, TYPE) {
    const Facebook = sequelize.define('facebook', {

        user_id: {
            type: TYPE.INTEGER,
            primaryKey: true,
            autoIncrement: false
        },

        fb_user_id: TYPE.STRING,

        fb_access_token: TYPE.STRING

    }, {

        timestamps: false,

        paranoid: false,

        classMethods: {
            associate: models => {
                Facebook.belongsTo(models.User)
            },
            moduleName: 'Facebook'
        }
    })

    return Facebook
}

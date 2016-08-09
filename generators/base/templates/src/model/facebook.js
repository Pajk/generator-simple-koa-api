module.exports = function (sequelize, T) {

    const Facebook = sequelize.define('facebook', {
        user_id         : {
            type: T.INTEGER,
            primaryKey: true,
            autoIncrement: false
        },
        fb_user_id      : T.STRING,
        fb_access_token : T.STRING
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

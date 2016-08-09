module.exports = function (sequelize, T) {

    const Session = sequelize.define('session', {
        user_id     : T.INTEGER,
        token       : T.STRING,
        expires_at  : T.DATE
    }, {
        updatedAt: false,
        paranoid: false,
        classMethods: {
            associate: models => {
                Session.belongsTo(models.User)
            },
            moduleName: 'Session'
        }
    })

    return Session
}

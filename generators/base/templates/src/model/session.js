module.exports = function sessionModelInit (sequelize, TYPE) {
    const Session = sequelize.define('session', {

        user_id: TYPE.INTEGER,

        token: TYPE.STRING,

        expires_at: TYPE.DATE

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

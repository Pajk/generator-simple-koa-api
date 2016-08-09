const config = require('../config/db')

const Sequelize = require('sequelize')
const fs = require('fs')
const path = require('path')

const sequelize = new Sequelize(config.connection_string, {
    pool: {
        max: 5,
        min: 1,
        idle: 10000
    },
    define: {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED
    },
    benchmark: true,
    logging: false
})

sequelize.authenticate()
    .then(() => console.log('==== Connection has been established successfully.'))
    .catch((err) => console.log('Unable to connect to the database:', err))


const db = {}

fs
    .readdirSync(__dirname)
    .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file))
        db[model.moduleName] = model
    })

Object.keys(db).forEach(modelName => {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db)
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
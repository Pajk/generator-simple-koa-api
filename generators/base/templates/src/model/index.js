/* eslint-disable no-sync */
const log = require('../helper/logger')
const config = require('../config/db')

const Sequelize = require('sequelize')
const path = require('path')
const fs = require('fs')


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

sequelize
    .authenticate()
    .catch(err => {
        log.error('Unable to connect to the database:', err)
        throw err
    })

const models = {}

fs
    .readdirSync(__dirname)
    .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file))

        models[model.moduleName] = model
    })

Object.keys(models).forEach(modelName => {
    if ('associate' in models[modelName]) {
        models[modelName].associate(models)
    }
})

models.sequelize = sequelize
models.Sequelize = Sequelize

module.exports = models

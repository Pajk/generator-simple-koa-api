/* eslint-disable no-sync, global-require */
const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(__dirname)

module.exports = files
    .filter(file => path.extname(file) === '.js' && file !== 'index.js')
    .reduce((config, file) => {
        config[path.basename(file, '.js')] = require(path.join(__dirname, file))
        return config
    }, {})

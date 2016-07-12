const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(__dirname)

module.exports = files.filter(function (file) {
    return path.extname(file) == '.js' && file != 'index.js'
}).reduce(function (config, file) {
    config[path.basename(file, '.js')] = require(__dirname + '/' + file)
    return config
}, {})

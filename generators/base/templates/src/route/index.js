'use strict'

const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(__dirname)

module.exports = function (koaApp) {
    files.filter(function (file) {
        return path.extname(file) == '.js' && file != 'index.js'
    }).forEach(function (file) {
        require(__dirname + '/' + file)(koaApp)
    })
}

const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(__dirname)

module.exports = function (koaApp) {
    files.filter(function (file) {
        return path.extname(file) == '.js' && file != 'index.js'
    }).forEach(function (file) {
        const router = require(__dirname + '/' + file)
        koaApp
            .use(router.routes())
            .use(router.allowedMethods())
    })
}
var generators = require('yeoman-generator')

module.exports = generators.Base.extend({

  initializing: function () {
    this.pkg = require('../../package.json')

    this.composeWith('simple-koa-api:base')
  }
})

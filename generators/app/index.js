var generators = require('yeoman-generator')

module.exports = generators.Base.extend({

  initializing: function () {
    this.pkg = require('../../package.json')

    this.option('password-reset')

    this.composeWith('simple-koa-api:base')

    if (this.options['password-reset']) {
      this.composeWith('simple-koa-api:password_reset')
    }


  }
})

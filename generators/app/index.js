var generators = require('yeoman-generator')

module.exports = generators.Base.extend({

  initializing: function () {
    this.pkg = require('../../package.json')
  },

  prompting: function () {
    var done = this.async()
    this.prompt([{
      type    : 'input',
      name    : 'apiName',
      message : 'Your API name',
      default : this.appname
    },{
      type    : 'input',
      name    : 'authorName',
      message : 'Author name',
      default : 'John Doe',
      store   : true
    },{
      type    : 'input',
      name    : 'authorEmail',
      message : 'Author email',
      default : 'developer@example.com',
      store   : true
    }], function (answers) {
      this.props = answers
      done()
    }.bind(this))
  },

  writing: {
    app: function () {

      var context = {
        API_NAME: this.props.apiName,
        AUTHOR_NAME: this.props.authorName,
        AUTHOR_EMAIL: this.props.authorEmail
      }

      this.fs.copyTpl(
        this.templatePath('package.json'),
        this.destinationPath('package.json'),
        context
      )

      this.fs.copy(
        this.templatePath('db-*'),
        this.destinationPath('.')
      )

      this.copy('test.js')
      this.copy('README.md', 'README.md', context)

      this.directory('src')
      this.directory('migrations')
      this.directory('test')
    },

    configfiles: function () {
      this.copy('_gitignore', '.gitignore')
      this.copy('_env', '.env')
      this.copy('_env-test', '.env-test')
      this.copy('_env', '.env.example')
      this.copy('_travis.yml', '.travis.yml')
      this.copy('.editorconfig')
      this.copy('.eslintrc.json')
    }
  }
})

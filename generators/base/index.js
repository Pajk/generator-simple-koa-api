var generators = require('yeoman-generator')

module.exports = generators.Base.extend({

  prompting: function () {
    var done = this.async()
    this.prompt([{
      type    : 'input',
      name    : 'apiName',
      message : 'Your API name (no spaces)',
      default : this.appname,
      store   : true
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
    },{
      type    : 'input',
      name    : 'databaseName',
      message : 'Database name',
      default : 'api',
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
        AUTHOR_EMAIL: this.props.authorEmail,
        DATABASE_NAME: this.props.databaseName
      }

      const copyTemplate = (from, to) => {
        this.fs.copyTpl(
          this.templatePath(from),
          this.destinationPath(to),
          context
        )
      }

      copyTemplate('package.json', 'package.json')

      this.fs.copy(
        this.templatePath('db-*'),
        this.destinationPath('.')
      )

      this.copy('README.md', 'README.md', context)

      this.directory('src')
      this.directory('migrations')
      this.directory('test')
      this.directory('doc')

      this.copy('_gitignore', '.gitignore')
      copyTemplate('_env', '.env')
      copyTemplate('_env-test', '.env-test')
      copyTemplate('_env', '.env.example')
      this.copy('_travis.yml', '.travis.yml')
      this.copy('.editorconfig')
      this.copy('.eslintrc.js')
      this.copy('.babelrc')
    }
  }
})

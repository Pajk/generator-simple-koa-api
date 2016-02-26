require('dotenv').load({ silent: true })

var co = require('co')
var ZenInjector = require('zazeninjector')
var container = new ZenInjector()

container.registerAndExport('logger', console)

var boot = function* () {
  yield container.scan(__dirname + '/**/*.js')

  if (process.env.NODE_ENV !== 'production') {
    container.saveGraphToFile('di-graph.dot', ['logger', 'config'])
  }

  var api = yield container.resolve('api')

  yield api.start
}

var handleError = (err) => {
  console.log(err.stack)
  throw err
}

co(boot).catch(handleError)

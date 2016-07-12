require('babel-core/register')({
    presets: ['es2015-node6', 'stage-3']
})

const api = require('./api')

api.start()

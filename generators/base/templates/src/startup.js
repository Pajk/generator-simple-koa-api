require('babel-core/register')({
    presets: ['es2015-node6', 'stage-3']
})

const api = require('./api')

api.start()

/* eslint-disable global-require, no-process-env */
if (process.env.REPL) {
    const repl = require('repl')

    const ctx = repl.start({ useColor: true }).context

    ctx.api = api

    ctx.loadResource = (resource, module) =>
        require(`./resource/${resource}/${resource}.${module || 'data'}`)

    ctx.loadModel = model => require('./model')[model]

    ctx.loadHelper = helper => require(`./helper/${helper}`)
}

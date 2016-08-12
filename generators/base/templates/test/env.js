require('dotenv').load({ path: '.env-test', silent: true })

require('babel-core/register')({
    presets: ['es2015-node6', 'stage-3']
})

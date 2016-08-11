const bunyan = require('bunyan')
const config = require('../config/log.js')

// log.trace, log.debug, log.info, log.warn, log.error, and log.fatal

module.exports = bunyan.createLogger({
    name: 'api',
    serializers: bunyan.stdSerializers,
    streams: [
        {
            level: config.logLevel,
            stream: process.stdout
        }
    ]
})

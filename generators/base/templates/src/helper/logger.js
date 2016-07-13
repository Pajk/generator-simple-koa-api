const bunyan = require('bunyan')

// log.trace, log.debug, log.info, log.warn, log.error, and log.fatal

module.exports = bunyan.createLogger({
    name: 'api',
    serializers: bunyan.stdSerializers,
    streams: [
        {
            level: process.env.LOG_LEVEL || 'info',
            stream: process.stdout
        }
    ]
})

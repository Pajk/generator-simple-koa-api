const _ = require('lodash')
const crypto = require('crypto')
const userRouter = require('../src/resource/user/user.router')

/**
 * @param  {object} request Supertest instance
 * @return {object}
 */
module.exports = function testHelperFactory (request) {
    return {

        request (options) {
            const method = options.method || 'get'
            const req = request[method.toLowerCase()](options.url || options.path)
            const expect = options.expect || options.status || options.assert

            if (options.user) {
                this.auth(options.user, req)
            }

            if (options.data) {
                req.send(options.data)
            }

            if (expect) {
                req.expect(expect)
            }

            if (options.headers) {
                _.each(options.headers, req.set)
            }

            return req.end()
        },

        auth (user, req) {
            return req.set('Authorization', `Bearer ${user.token}`)
        },

        randomize (text) {
            return text + Date.now() + Math.floor(1000 * Math.random())
        },

        randomString (length) {
            length = length || 10
            return crypto.randomBytes(parseInt(length / 2)).toString('hex')
        },

        // ==== user ====

        * createUser (attributes) {
            const randomUser = {
                first_name: `First ${Date.now()}${Math.floor(1000000 * Math.random())}`,
                last_name: `Last ${Date.now()}${Math.floor(1000000 * Math.random())}`,
                password: 'secretpassword',
                email: `${Math.floor(1000000 * Math.random())}${(new Date()).getTime()}@example.com`
            }

            Object.assign(randomUser, attributes)

            const resp = yield this.request({
                method: 'post',
                url: userRouter.url('createUser'),
                data: randomUser,
                expect: 201
            })

            Object.assign(randomUser, resp.body)

            return randomUser
        }
    }
}

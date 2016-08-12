const _ = require('lodash')
const crypto = require('crypto')
const userRouter = require('../src/resource/user/user.router')

/**
 * @param  {object} supertest Supertest instance
 * @return {object}
 */
module.exports = function testHelperFactory (supertest) {
    return {

        request (options) {
            const method = options.method || 'get'
            const request = supertest[method.toLowerCase()](options.url || options.path)
            const expect = options.expect || options.status || options.assert

            if (options.user) {
                this.auth(options.user, request)
            }

            if (options.data) {
                request.send(options.data)
            }

            if (expect) {
                request.expect(expect)
            }

            if (options.headers) {
                _.each(options.headers, request.set)
            }

            return request
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

        async createUser (attributes) {
            const randomUser = {
                first_name: `First ${Date.now()}${Math.floor(1000000 * Math.random())}`,
                last_name: `Last ${Date.now()}${Math.floor(1000000 * Math.random())}`,
                password: 'secretpassword',
                email: `${Math.floor(1000000 * Math.random())}${(new Date()).getTime()}@example.com`
            }

            Object.assign(randomUser, attributes)

            const resp = await this.request({
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

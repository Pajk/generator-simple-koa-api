const _ = require('lodash')
const userRouter = require('../src/resource/user/user.router')

const testHelperFactory = function(request) {

    const helper = {}

    helper.request = function(method, path, user, data, expect, headers) {
        const req = request[method](path)

        if (user) {
            helper.auth(user, req)
        }

        if (data) {
            req.send(data)
        }

        if (expect) {
            req.expect(expect)
        }

        if (headers) {
            _.each(headers, req.set)
        }

        return req.end()
    }

    helper.auth = function(user, req) {
        return req.set('Authorization', 'Bearer ' + user.token)
    }

    helper.put = function* (path, user, data, expect, headers) {
        return yield helper.request('put', path, user, data, expect, headers)
    }

    helper.del = function* (path, user, expect, headers) {
        return yield helper.request('delete', path, user, null, expect, headers)
    }

    helper.get = function* (path, user, expect, headers) {
        return yield helper.request('get', path, user, null, expect, headers)
    }

    helper.post = function* (path, user, data, expect, headers) {
        return yield helper.request('post', path, user, data, expect, headers)
    }

    helper.randomize = function(text) {
        return text + Date.now() + Math.floor(1000*Math.random())
    }

  // ==== user ====

    helper.createUser = function* (attributes) {
        const random_user = {
            first_name: `First ${Date.now()}${Math.floor(1000000*Math.random())}`,
            last_name: `Last ${Date.now()}${Math.floor(1000000*Math.random())}`,
            password: 'secretpassword',
            email: `${Math.floor(1000000*Math.random())}${(new Date).getTime()}@example.com`
        }

        Object.assign(random_user, attributes)

        const resp = yield this.post(userRouter.url('create_user'), null, random_user, 201)
        Object.assign(random_user, resp.body)

        return random_user
    }

    return helper
}

module.exports = testHelperFactory

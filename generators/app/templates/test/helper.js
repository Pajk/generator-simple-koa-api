'use strict'

var _ = require('lodash')

var testHelperFactory = function(request/*, container*/) {

  var helper = {}

  helper.request = function(method, path, user, data, expect, headers) {

    let req = request[method](path)

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
    return req.set('Authorization', 'Bearer ' + user.session_token)
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
    let random_user = {
      name: `User ${Date.now()}${Math.floor(1000000*Math.random()) + (new Date).getTime()}`,
      password: 'secretpassword',
      email: `${Math.floor(1000000*Math.random())}${(new Date).getTime()}@example.com`
    }

    Object.assign(random_user, attributes)

    let resp = yield this.post('/users', null, random_user, 201)

    Object.assign(random_user, resp.body)

    return random_user
  }

  return helper
}

module.exports = testHelperFactory


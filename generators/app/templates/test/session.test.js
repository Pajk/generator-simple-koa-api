'use strict'

module.exports = function(test, request, helper) {

  test('== ' + __filename + ' ==', function*() {})

  test('login user', function* (t) {
    let user = yield helper.createUser()
    let creds = {
      email: user.email,
      password: user.password
    }
    t.ok(user, 'user created')

    let resp = yield helper.post('/session', null, creds, 201)

    t.equal(resp.body.user_id, user.user_id, 'response contains user id')
    t.ok(resp.body.session_token, 'response contains session token')
    t.notEqual(resp.body.session_token, user.session_token, 'new session token was generated')

    creds.password = 'asdfeee'
    resp = yield helper.post('/session', null, creds, 403)
    t.pass('wrong password returns 403')

    creds.username = 'madeup'
    resp = yield helper.post('/session', null, creds, 403)
    t.pass('wrong username returns 403')
  })
}

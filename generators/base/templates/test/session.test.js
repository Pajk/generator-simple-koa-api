const sessionRouter = require('../src/resource/session/session.router')

module.exports = (should, request, helper) => {

    should('== ' + __filename + ' ==', function* () {})

    should('Login user', function* (t) {
        const user = yield helper.createUser()
        const creds = {
            email: user.email,
            password: user.password
        }
        t.ok(user, 'user created')

        const resp = yield helper.post(sessionRouter.url('createSession'), null, creds, 201)

        t.equal(resp.body.id, user.id, 'response contains user id')
        t.ok(resp.body.token, 'response contains session token')
        t.notEqual(resp.body.token, user.token, 'new session token was generated')

        creds.password = 'asdfeee'
        yield helper.post(sessionRouter.url('createSession'), null, creds, 403)
        t.pass('wrong password returns 403')

        creds.email = 'madeup@mail.com'
        yield helper.post(sessionRouter.url('createSession'), null, creds, 403)
        t.pass('wrong email returns 403')
    })

    should('Reject invalid credentials', function* (t) {
        t.pass('-- invalid email/password')
        let resp = yield helper.post(sessionRouter.url('createSession'), null, {
            email: 'abc',
            password: 'hmmm'
        }, 422)

        t.ok(resp.body.message, 'contains message')
        t.ok(resp.body.errors, 'contains errors')
        t.ok(resp.body.errors.email, 'contains email error')
        t.ok(resp.body.errors.password, 'contains email error')
        t.equal(resp.body.status_code, 422, 'contains status code')

        t.pass('-- empty body')
        resp = yield helper.post(sessionRouter.url('createSession'), null, null, 422)

        t.ok(resp.body.message, 'contains message')
        t.ok(resp.body.errors, 'contains errors')
        t.ok(resp.body.errors.email, 'contains email error')
        t.ok(resp.body.errors.password, 'contains email error')
        t.equal(resp.body.status_code, 422, 'contains status code')

        t.pass('--  valid but not in db')
        resp = yield helper.post(sessionRouter.url('createSession'), null, {
            email: 'abcasdlfkj@lkhsadf.com',
            password: 'validpassword'
        }, 403)

        t.ok(resp.body.message, 'contains message')
        t.equal(resp.body.status_code, 403, 'contains status code')
    })

    should('Logout user', function* (t) {
        const logoutUrl = sessionRouter.url('deleteSession')
        const user = yield helper.createUser()
        const creds = {
            email: user.email,
            password: user.password
        }

        yield helper.del(logoutUrl, user, null, 201)

        const resp = yield helper.post(sessionRouter.url('createSession'), null, creds, 201)

        const token = resp.body.token

        yield helper.del(logoutUrl, { token }, 204)
        t.pass('logout with valid token')

        yield helper.del(logoutUrl, { token }, 401)
        t.pass('logout with invalid token')
    })
}

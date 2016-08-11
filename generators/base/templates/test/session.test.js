const sessionRouter = require('../src/resource/session/session.router')

module.exports = (should, request, helper) => {
    should(`== ${__filename}  ==`, function* test () {})

    should('Login user', function* test (assert) {
        const user = yield helper.createUser()
        const creds = {
            email: user.email,
            password: user.password
        }

        assert.ok(user, 'user created')

        const resp = yield helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: creds,
            status: 201
        })

        assert.equal(resp.body.id, user.id, 'response contains user id')
        assert.ok(resp.body.token, 'response contains session token')
        assert.notEqual(resp.body.token, user.token, 'new session token was generated')

        creds.password = 'asdfeee'
        yield helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: creds,
            status: 403
        })
        assert.pass('wrong password returns 403')

        creds.email = 'madeup@mail.com'
        yield helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: creds,
            status: 403
        })
        assert.pass('wrong email returns 403')
    })

    should('Reject invalid credentials', function* test (assert) {
        assert.pass('-- invalid email/password')
        let resp = yield helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: {
                email: 'abc',
                password: 'hmmm'
            },
            status: 422
        })

        assert.ok(resp.body.message, 'contains message')
        assert.ok(resp.body.errors, 'contains errors')
        assert.ok(resp.body.errors.email, 'contains email error')
        assert.ok(resp.body.errors.password, 'contains email error')
        assert.equal(resp.body.status_code, 422, 'contains status code')

        assert.pass('-- empty body')
        resp = yield helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            status: 422
        })

        assert.ok(resp.body.message, 'contains message')
        assert.ok(resp.body.errors, 'contains errors')
        assert.ok(resp.body.errors.email, 'contains email error')
        assert.ok(resp.body.errors.password, 'contains email error')
        assert.equal(resp.body.status_code, 422, 'contains status code')

        assert.pass('--  valid but not in db')
        resp = yield helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: {
                email: 'abcasdlfkj@lkhsadf.com',
                password: 'validpassword'
            },
            status: 403
        })

        assert.ok(resp.body.message, 'contains message')
        assert.equal(resp.body.status_code, 403, 'contains status code')
    })

    should('Logout user', function* test (assert) {
        const logoutUrl = sessionRouter.url('deleteSession')
        const user = yield helper.createUser()
        const creds = {
            email: user.email,
            password: user.password
        }

        yield helper.request({
            method: 'del',
            url: logoutUrl,
            user,
            status: 204
        })

        const resp = yield helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: creds,
            status: 201
        })

        const token = resp.body.token

        yield helper.request({
            method: 'del',
            url: logoutUrl,
            user: { token },
            status: 204
        })
        assert.pass('logout with valid token')

        yield helper.request({
            method: 'del',
            url: logoutUrl,
            user: { token },
            status: 401
        })
        assert.pass('logout with invalid token')
    })
}

const userRouter = require('../src/routes/user-routes')

module.exports = function(should, request, helper) {

    should('== ' + __filename + ' ==', function* () {})

    should('Create a user', function* (t) {
        const user = yield helper.createUser()
        t.ok(user, 'user created')
        t.ok(user.token, 'response contains session token')
        t.ok(user.id, 'response contains user id')
    })

    should('Create a user with the existing email', function* (t) {
        const user = yield helper.createUser()

        const resp = yield helper.post(userRouter.url('signup'), null, user, 422)

        t.ok(resp.body.message, 'contains message')
        t.ok(resp.body.errors, 'contains errors')
        t.ok(resp.body.errors.email, 'contains email error')
        t.equal(resp.body.status_code, 422, 'contains status code')

        t.pass('server returns 403')
    })

    should('Check required fields', function* (t) {
        const resp = yield helper.post(userRouter.url('signup'), null, {
            first_name: 'John',
            password: 'short'
        }, 422)

        t.ok(resp.body.message, 'contains message')
        t.ok(resp.body.errors, 'contains errors')
        t.ok(resp.body.errors.email, 'contains email error')
        t.ok(resp.body.errors.password, 'contains email error')
        t.equal(resp.body.status_code, 422, 'contains status code')
    })

    should('Get user profile', function* (t) {
        const user = yield helper.createUser()
        const resp = yield helper.get(userRouter.url('get profile'), user, 200)
        const data = resp.body.user

        t.ok(data, 'response contains user')
        t.ok(data.email, 'email addresses')
        t.ok(data.first_name, 'first name')
        t.ok(data.last_name, 'last name')
    })

    should('Fail to get profile using unauthorized request', function* (t) {
        yield helper.get(userRouter.url('get profile'), null, 401)

        t.pass('server returns 401')
    })

    should('Login user', function* (t) {
        const user = yield helper.createUser()
        const creds = {
            email: user.email,
            password: user.password
        }
        t.ok(user, 'user created')

        const resp = yield helper.post(userRouter.url('login'), null, creds, 201)

        t.equal(resp.body.id, user.id, 'response contains user id')
        t.ok(resp.body.token, 'response contains session token')
        t.notEqual(resp.body.token, user.token, 'new session token was generated')

        creds.password = 'asdfeee'
        yield helper.post(userRouter.url('login'), null, creds, 403)
        t.pass('wrong password returns 403')

        creds.username = 'madeup'
        yield helper.post(userRouter.url('login'), null, creds, 403)
        t.pass('wrong username returns 403')
    })

    should('Reject invalid credentials', function* (t) {
        t.pass('-- invalid email/password')
        let resp = yield helper.post(userRouter.url('login'), null, {
            email: 'abc',
            password: 'hmmm'
        }, 422)

        t.ok(resp.body.message, 'contains message')
        t.ok(resp.body.errors, 'contains errors')
        t.ok(resp.body.errors.email, 'contains email error')
        t.ok(resp.body.errors.password, 'contains email error')
        t.equal(resp.body.status_code, 422, 'contains status code')

        t.pass('-- empty body')
        resp = yield helper.post(userRouter.url('login'), null, null, 422)

        t.ok(resp.body.message, 'contains message')
        t.ok(resp.body.errors, 'contains errors')
        t.ok(resp.body.errors.email, 'contains email error')
        t.ok(resp.body.errors.password, 'contains email error')
        t.equal(resp.body.status_code, 422, 'contains status code')

        t.pass('--  valid but not in db')
        resp = yield helper.post(userRouter.url('login'), null, {
            email: 'abcasdlfkj@lkhsadf.com',
            password: 'validpassword'
        }, 403)

        t.ok(resp.body.message, 'contains message')
        t.equal(resp.body.status_code, 403, 'contains status code')
    })

    should('Logout user', function* (t) {
        const logoutUrl = userRouter.url('logout')
        const user = yield helper.createUser()
        const creds = {
            email: user.email,
            password: user.password
        }

        yield helper.del(logoutUrl, user, null, 201)

        const resp = yield helper.post(userRouter.url('login'), null, creds, 201)

        const token = resp.body.token

        yield helper.del(logoutUrl, { token }, 204)
        t.pass('logout with valid token')

        yield helper.del(logoutUrl, { token }, 401)
        t.pass('logout with invalid token')
    })
}

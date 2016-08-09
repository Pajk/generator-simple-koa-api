const userRouter = require('../src/resource/user/user.router')

module.exports = (should, request, helper) => {

    should('== ' + __filename + ' ==', function* () {})

    should('Create a user', function* (t) {
        const user = yield helper.createUser()
        t.ok(user, 'user created')
        t.ok(user.token, 'response contains session token')
        t.ok(user.id, 'response contains user id')
    })

    should('Prevent to signup twice with the same email address', function* (t) {
        const user = yield helper.createUser()

        const newUser = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: user.password
        }

        const resp = yield helper.post(userRouter.url('createUser'), null, newUser, 422)

        t.ok(resp.body.message, 'contains message')
        t.ok(resp.body.errors, 'contains errors')
        t.ok(resp.body.errors.email, 'contains email error')
        t.equal(resp.body.status_code, 422, 'contains status code')

        t.pass('server returns 403')
    })

    should('Check required fields', function* (t) {
        const resp = yield helper.post(userRouter.url('createUser'), null, {
            first_name: 'John',
            password: 'short'
        }, 422)

        t.ok(resp.body.message, 'contains message')
        t.ok(resp.body.errors, 'contains errors')
        t.ok(resp.body.errors.email, 'contains email error')
        t.ok(resp.body.errors.password, 'contains email error')
        t.equal(resp.body.status_code, 422, 'contains status code')
    })
}

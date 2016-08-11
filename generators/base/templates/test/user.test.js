const userRouter = require('../src/resource/user/user.router')

module.exports = (should, request, helper) => {
    should(`== ${__filename} ==`, function* test () {})

    should('Create a user', function* test (assert) {
        const user = yield helper.createUser()

        assert.ok(user, 'user created')
        assert.ok(user.token, 'response contains session token')
        assert.ok(user.id, 'response contains user id')
    })

    should('Prevent to signup twice with the same email address', function* test (assert) {
        const user = yield helper.createUser()

        const newUser = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: user.password
        }

        const resp = yield helper.request({
            method: 'post',
            url: userRouter.url('createUser'),
            data: newUser,
            status: 422
        })

        assert.ok(resp.body.message, 'contains message')
        assert.ok(resp.body.errors, 'contains errors')
        assert.ok(resp.body.errors.email, 'contains email error')
        assert.equal(resp.body.status_code, 422, 'contains status code')

        assert.pass('server returns 403')
    })

    should('Check required fields', function* test (assert) {
        const resp = yield helper.request({
            url: userRouter.url('createUser'),
            method: 'post',
            data: {
                first_name: 'John',
                password: 'short'
            },
            status: 422
        })

        assert.ok(resp.body.message, 'contains message')
        assert.ok(resp.body.errors, 'contains errors')
        assert.ok(resp.body.errors.email, 'contains email error')
        assert.ok(resp.body.errors.password, 'contains email error')
        assert.equal(resp.body.status_code, 422, 'contains status code')
    })
}

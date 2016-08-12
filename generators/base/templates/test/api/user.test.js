/* eslint-disable no-undef, arrow-parens */

const userRouter = require('../../src/resource/user/user.router')

describe('User API', () => {
    it('Should create a user', async () => {
        const user = await helper.createUser()

        assert.ok(user, 'user created')
        assert.ok(user.token, 'response contains session token')
        assert.ok(user.id, 'response contains user id')
    })

    it('Should prevent to signup twice with the same email address', async () => {
        const user = await helper.createUser()

        const newUser = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: user.password
        }

        const resp = await helper.request({
            method: 'post',
            url: userRouter.url('createUser'),
            data: newUser,
            status: 422
        })

        assert.ok(resp.body.message, 'contains message')
        assert.ok(resp.body.errors, 'contains errors')
        assert.ok(resp.body.errors.email, 'contains email error')
        assert.equal(resp.body.status_code, 422, 'contains status code')
    })

    it('Should check required fields', async () => {
        const resp = await helper.request({
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
})

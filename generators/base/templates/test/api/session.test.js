/* eslint-disable no-undef, arrow-parens */
const sessionRouter = require('../../src/resource/session/session.router')

describe('Session API', () => {
    it('Should login user', async () => {
        const user = await helper.createUser()
        const creds = {
            email: user.email,
            password: user.password
        }

        assert.ok(user, 'user created')

        const resp = await helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: creds,
            status: 201
        })

        assert.equal(resp.body.id, user.id, 'response contains user id')
        assert.ok(resp.body.token, 'response contains session token')
        assert.notEqual(resp.body.token, user.token, 'new session token was generated')

        creds.password = 'asdfeee'
        await helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: creds,
            status: 403
        })

        creds.email = 'madeup@mail.com'
        await helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: creds,
            status: 403
        })
    })

    it('Should reject invalid credentials', async () => {
        // -- invalid email/password
        let resp = await helper.request({
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

        // -- empty body
        resp = await helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            status: 422
        })

        assert.ok(resp.body.message, 'contains message')
        assert.ok(resp.body.errors, 'contains errors')
        assert.ok(resp.body.errors.email, 'contains email error')
        assert.ok(resp.body.errors.password, 'contains email error')
        assert.equal(resp.body.status_code, 422, 'contains status code')

        // --  valid but not in db
        resp = await helper.request({
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

    it('Should logout user', async () => {
        const logoutUrl = sessionRouter.url('deleteSession')
        const user = await helper.createUser()
        const creds = {
            email: user.email,
            password: user.password
        }

        await helper.request({
            method: 'del',
            url: logoutUrl,
            user,
            status: 204
        })

        const resp = await helper.request({
            method: 'post',
            url: sessionRouter.url('createSession'),
            data: creds,
            status: 201
        })

        const token = resp.body.token

        await helper.request({
            method: 'del',
            url: logoutUrl,
            user: { token },
            status: 204
        })

        await helper.request({
            method: 'del',
            url: logoutUrl,
            user: { token },
            status: 401
        })
    })
})

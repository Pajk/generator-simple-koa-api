/* eslint-disable no-undef, arrow-parens */
const profileRouter = require('../src/resource/profile/profile.router')

describe('Profile API', () => {
    it('Should get user profile', async () => {
        const user = await helper.createUser()
        const resp = await helper.request({
            url: profileRouter.url('getProfile'),
            user,
            expect: 200
        })
        const data = resp.body

        assert.ok(data, 'response contains user')
        assert.ok(data.email, 'email addresses')
        assert.ok(data.first_name, 'first name')
        assert.ok(data.last_name, 'last name')
    })

    it('Should fail to get profile using unauthorized request', async () => {
        await helper.request({
            url: profileRouter.url('getProfile'),
            expect: 401
        })
    })

    it('Should update profile info', async () => {
        const user = await helper.createUser()
        const fields = {
            first_name: helper.randomString(),
            last_name: helper.randomString(),
            address: {
                line1: helper.randomString(),
                line2: helper.randomString(),
                city: helper.randomString(),
                state: helper.randomString(),
                zip: '39492',
                country: helper.randomString()
            }
        }
        let resp = await helper.request({
            method: 'put',
            url: profileRouter.url('updateProfile'),
            user,
            data: fields,
            expect: 200
        })
        const data = resp.body

        assert.ok(data, 'response contains user')
        for (const key of Object.keys(fields)) {
            assert.deepEqual(data[key], fields[key], `${key} updated`)
        }

        resp = await helper.request({
            method: 'put',
            url: profileRouter.url('updateProfile'),
            user,
            data: fields,
            expect: 200
        })

        assert.equal(resp.body.address_id, data.address_id, 'Address ID remained the same')
    })

    it('Should allow to change profile avatar', async () => {
        const user = await helper.createUser()
        const fields = {
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: 'https://www.pictures.com/avatar'
        }

        const resp = await helper.request({
            method: 'put',
            url: profileRouter.url('updateProfile'),
            user,
            data: fields,
            expect: 200
        })

        assert.equal(resp.body.avatar_url, fields.avatar_url, 'Avatar url changed')
    })

    it('Should get profile with user metadata', async () => {
        const user = await helper.createUser()
        let resp = await helper.request({
            url: profileRouter.url('getProfile'),
            user,
            expect: 200
        })
        const data = resp.body

        // t.equal(data.subscription, '', '')
        // t.equal(data.num_properties, 0, 'Number of properties')
        assert.equal(data.reg_ip, '::ffff:127.0.0.1', 'Registration IP')
        assert.ok(data.last_login, 'Last login time')
        assert.ok(data.created_at, 'Created at time')
        assert.ok(data.updated_at, 'Updated at time')

        await helper.request({
            method: 'put',
            url: profileRouter.url('updateProfile'),
            user,
            data: {
                first_name: 'Pavel',
                last_name: 'Xzzzkkk'
            },
            expect: 200
        })

        resp = await helper.request({
            url: profileRouter.url('getProfile'),
            user,
            expect: 200
        })

        assert.notEqual(resp.body.updated_at, data.updated_at, 'Updated at time set after update')
    })

    it('Should not allow to change email address', async () => {
        const user = await helper.createUser()
        const fields = { first_name: 'abc', last_name: 'cdd', email: 'valid@email.com' }
        const resp = await helper.request({
            method: 'put',
            url: profileRouter.url('updateProfile'),
            user,
            data: fields,
            expect: 422
        })

        assert.ok(resp.body.errors.email, 'Contains email error message')
    })
})

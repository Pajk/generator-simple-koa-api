const profileRouter = require('../src/resource/profile/profile.router')

module.exports = (should, request, helper) => {

    should('== ' + __filename + ' ==', function* () {})

    should('Get user profile', function* (t) {
        const user = yield helper.createUser()
        const resp = yield helper.get(profileRouter.url('getProfile'), user, 200)
        const data = resp.body

        t.ok(data, 'response contains user')
        t.ok(data.email, 'email addresses')
        t.ok(data.first_name, 'first name')
        t.ok(data.last_name, 'last name')
    })

    should('Fail to get profile using unauthorized request', function* (t) {
        yield helper.get(profileRouter.url('getProfile'), null, 401)

        t.pass('server returns 401')
    })

    should('Update profile info', function* (t) {
        const user = yield helper.createUser()
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
        let resp = yield helper.put(profileRouter.url('updateProfile'), user, fields, 200)
        const data = resp.body

        t.ok(data, 'response contains user')
        for (const key of Object.keys(fields)) {
            t.deepEqual(data[key], fields[key], key + ' updated')
        }

        resp = yield helper.put(profileRouter.url('updateProfile'), user, fields, 200)

        t.equal(resp.body.address_id, data.address_id, 'Address ID remained the same')
    })

    should('Allow to set profile avatar', function* (t) {
        const user = yield helper.createUser()
        const fields = {
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: 'https://www.pictures.com/avatar'
        }

        let resp = yield helper.put(profileRouter.url('updateProfile'), user, fields, 200)
        t.equal(resp.body.avatar_url, fields.avatar_url, 'Avatar url changed')
    })

    should('Contain user metadata', function* (t) {
        const user = yield helper.createUser()
        let resp = yield helper.get(profileRouter.url('getProfile'), user, 200)
        const data = resp.body

        // t.equal(data.subscription, '', '')
        // t.equal(data.num_properties, 0, 'Number of properties')
        t.equal(data.reg_ip, '::ffff:127.0.0.1', 'Registration IP')
        t.ok(data.last_login, 'Last login time')
        t.ok(data.created_at, 'Created at time')
        t.ok(data.updated_at, 'Updated at time')

        yield helper.put(profileRouter.url('updateProfile'), user, {
            first_name: 'Pavel',
            last_name: 'Xzzzkkk'
        }, 200)

        resp = yield helper.get(profileRouter.url('getProfile'), user, 200)

        t.notEqual(resp.body.updated_at, data.updated_at, 'Updated at time set after update')
    })

    should('Not allow to change email address', function* (t) {
        const user = yield helper.createUser()
        const fields = { first_name: 'abc', last_name: 'cdd', email: 'valid@email.com' }
        const r = yield helper.put(profileRouter.url('updateProfile'), user, fields, 422)
        t.ok(r.body.errors.email, 'Contains email error message')
    })
}

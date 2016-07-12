module.exports = function(should, request, helper) {

    should('== ' + __filename + ' ==', function* () {})

    should('Create a user', function* (t) {
        const user = yield helper.createUser()
        t.ok(user, 'user created')
        t.ok(user.session_token, 'response contains session token')
        t.ok(user.user_id, 'response contains user id')
    })

    should('Create a user with the existing email', function* (t) {
        const user = yield helper.createUser()

        yield helper.post('/users', null, user, 403)

        t.pass('server returns 403')
    })

    should('Fail to get list using unauthorized request', function* (t) {
        yield helper.get('/users/1', null, 401)

        t.pass('server returns 401')
    })

    should('Get list of users', function* (t) {
        const user = yield helper.createUser()
        const resp = yield helper.get('/users', user, 200)

        t.ok(resp.body.data.length > 1, 'server returns more than one user')
        t.ok(resp.body.data[0].email, 'server does return email addresses')
    })

    should('Get public list of users', function* (t) {
        const resp = yield helper.get('/users', null, 200)

        t.ok(resp.body.data.length > 1, 'server returns more than one user')
        t.notOk(resp.body.data[0].email, 'server does not return email addresses')
    })

}

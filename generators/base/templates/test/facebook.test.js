/* eslint-disable */
// const facebookRouter = require('../src/resource/facebook/facebook.router')

module.exports = (should, request, helper) => {

    // should('== ' + __filename + ' ==', function* () {})

    // this is not easily tested but you can set fb_user_id and fb_access_token manually
    // const fbUserId = '123'
    // const fbAccessToken = 'xxx'

    // should('Assign FB to existing user', function* (t) {
    //     // first register user and than try to login with facebook
    //     const nativeUser = yield helper.createUser({ email: 'pajkycz@gmail.com' })
    //     const resp = yield request
    //         .post(facebookRouter.url('facebookLogin'))
    //         .send({ fb_user_id: fbUserId, fb_access_token: fbAccessToken })
    //         .expect(200)
    //         .end()
    //
    //     t.equal(nativeUser.id, resp.body.id, 'FB user linked to already registered user')
    // })

    // should('User should be able to signup through facebook', function* (t) {
    //
    //     const firstName = `First${Date.now()}${Math.floor(1000000*Math.random()) + (new Date).getTime()}`
    //     const lastName = `Last${Date.now()}${Math.floor(1000000*Math.random()) + (new Date).getTime()}`
    //
    //     let resp = yield request
    //         .post(facebookRouter.url('facebookSignup'))
    //         .send({
    //             first_name: firstName,
    //             last_name: lastName,
    //             email: 'xyz@gmail.com',
    //             fb_user_id: fbUserId,
    //             fb_access_token: fbAccessToken
    //         })
    //         .expect(201)
    //         .end()
    //
    //     const user = resp.body
    //     t.ok(user.token && user.id, 'user created')
    //
    //     resp = yield request
    //         .post(facebookRouter.url('facebookLogin'))
    //         .send({
    //             fb_user_id: fbUserId,
    //             fb_access_token: fbAccessToken
    //         })
    //         .expect(200)
    //         .end()
    //
    //     t.equal(resp.body.id, user.id, 'response contains user id')
    //     t.ok(resp.body.token, 'response contains session token')
    //     t.notEqual(resp.body.token, user.token, 'new session token was generated')
    //
    //     resp = yield request
    //         .post(facebookRouter.url('facebookLogin'))
    //         .send({
    //             fb_user_id: fbUserId,
    //             fb_access_token: 'invalidtoken'
    //         })
    //         .expect(403)
    //         .end()
    //
    //     t.pass('wrong session token 403')
    //
    //     resp = yield request
    //         .post(facebookRouter.url('facebookSignup'))
    //         .send({
    //             first_name: firstName,
    //             last_name: lastName,
    //             email: 'newfbusername@gmail.com',
    //             fb_user_id: fbUserId,
    //             fb_access_token: fbAccessToken
    //         })
    //         .expect(403)
    //         .end()
    //
    //     console.log(resp.body)
    //
    //     t.pass('repeated signup not allowed')
    // })

}

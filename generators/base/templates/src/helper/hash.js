const credential = require('credential')
const pw = credential({ work: 0.4 })

const helper = {}

helper.get = async function (pass) {
    const hash = await pw.hash(pass)

    return Buffer(hash).toString('base64')
}

helper.verify = async function (hashObjectBase64, inputPassword) {
    const unbased = new Buffer(hashObjectBase64, 'base64').toString('ascii')

    return await pw.verify(unbased, inputPassword)
}

module.exports = helper

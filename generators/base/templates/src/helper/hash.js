const credential = require('credential')
const pw = credential({ work: 0.1 })

module.exports = {

    async get (pass) {
        const hash = await pw.hash(pass)

        return new Buffer(hash).toString('base64')
    },

    async verify (hashObjectBase64, inputPassword) {
        const unbased = new Buffer(hashObjectBase64, 'base64').toString('ascii')

        return await pw.verify(unbased, inputPassword)
    }
}

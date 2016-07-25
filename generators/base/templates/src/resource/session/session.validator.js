const v = require('validator')
const baseValidator = require('../../validator/base')

const rules = {
    email: [
        [
            'Email can be max 200 characters long',
            v.isLength, 5, 200
        ],
        [
            'Email is not valid',
            v.isEmail
        ]
    ],
    password: [
        'Password must be at least 7 characters long',
        v.isLength, 7, 100
    ]
}

const required = {
    email: 'Email is required',
    password: 'Password is required'
}

module.exports.validate = baseValidator.create(rules, required)

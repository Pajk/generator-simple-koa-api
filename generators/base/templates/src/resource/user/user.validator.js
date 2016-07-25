const v = require('validator')
const baseValidator = require('../../helper/validator')

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
    first_name: [
        'First name must be at least 2 and max 100 characters long',
        v.isLength, 2, 100
    ],
    last_name: [
        'Last name must be at least 2 and max 100 characters long',
        v.isLength, 2, 100
    ],
    password: [
        'Password must be at least 7 characters long',
        v.isLength, 7, 100
    ]
}

const required = {
    email: 'Email is required',
    password: 'Password is required',
    first_name: 'First name is required',
    last_name: 'Last name is required'
}

module.exports.validate = baseValidator.create(rules, required)

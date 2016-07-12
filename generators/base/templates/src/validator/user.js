'use strict'

const v = require('validator')
const baseValidator = require('./base')

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
    name: [
        'Name must be at least 2 and max 100 characters long',
        v.isLength, 2, 100
    ],
    password: [
        'Password must be at least 7 characters long',
        v.isLength, 7, 100
    ]
}

const required = [
    'email', 'password'
]

module.exports.validate = baseValidator.create(rules, required)

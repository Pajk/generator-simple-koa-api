var v = require('validator')

var userValidatorFactory = function(base_validator) {

  var rules = {
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

  var required = [
    'email', 'password'
  ]

  return {
    assertValid: base_validator.create(rules, required)
  }
}

// @autoinject
module.exports.user_validator = userValidatorFactory


const Joi = require('joi')
const baseValidator = require('../../helper/validator.joi')

const schema = Joi.object({

    email: Joi
        .string()
        .email()
        .required()
        .label('E-mail'),

    password: Joi
        .string()
        .min(7)
        .max(100)
        .required()
        .label('Password'),

    first_name: Joi
        .string()
        .min(2)
        .max(100)
        .required()
        .label('First Name'),

    last_name: Joi
        .string()
        .min(2)
        .max(100)
        .required()
        .label('Last Name'),

    avatar_url: Joi
        .string()
        .uri()
        .label('Profile picture'),

    reg_ip: Joi
        .string()
        .ip()
        .default(Joi.ref('$ip'))
        .forbidden()
})

module.exports = baseValidator.create(schema)
module.exports.schema = schema

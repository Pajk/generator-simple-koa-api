const Joi = require('joi')
const baseValidator = require('../../helper/validator.joi')
const userValidatorSchema = require('../user/user.validator').schema

const schema = userValidatorSchema.keys({

    password: Joi
        .string()
        .min(7)
        .max(100)
        .optional()
        .label('Password'),

    fb_user_id: Joi
        .string()
        .required()
        .label('FB User ID'),

    fb_access_token: Joi
        .string()
        .required()
        .label('FB Access Token')
})

module.exports = baseValidator.create(schema)

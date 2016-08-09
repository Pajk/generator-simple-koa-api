const Joi = require('joi')
const baseValidator = require('../../helper/validator.joi')

const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(7).max(100).required()
})

module.exports = baseValidator.create(schema)

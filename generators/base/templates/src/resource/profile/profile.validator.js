const Joi = require('joi')
const baseValidator = require('../../helper/validator.joi')

const schema = Joi.object({
    first_name: Joi.string().min(2).max(100).required().label('First name'),
    last_name: Joi.string().min(2).max(100).required().label('Last name'),
    address_id: Joi.default(Joi.ref('$address_id')),
    avatar_url: Joi.string().uri(),
    address: Joi.object({
        line1: Joi.string().required(),
        line2: Joi.string(),
        city: Joi.string().min(3).max(50).required(),
        state: Joi.string().min(2).max(50).required(),
        country: Joi.string().min(2).max(50).required(),
        zip: Joi.string().min(5).max(10).required()
    }).optional()
})

module.exports = baseValidator.create(schema)

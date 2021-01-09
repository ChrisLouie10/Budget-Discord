const Joi = require('@hapi/joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().max(32).required(),
        email: Joi.string().max(64).required().email(),
        password: Joi.string().max(32).min(10).required()
    });
    return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().max(64).required().email(),
        password: Joi.string().max(32).min(10).required()
    });
    return schema.validate(data);
};

const updatePasswordValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().max(64).required().email(),
        oldPassword: Joi.string().max(32).min(10).required(),
        password: Joi.string().max(32).min(10).required()
    });
    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.updatePasswordValidation = updatePasswordValidation;
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
    const emailSchema = Joi.object({
        email: Joi.string().max(64).required().email()
    });
    const passwordSchema = Joi.object({
        password: Joi.string().max(32).min(10).required()
    });
    // Validate email and password separately so that we can return
    // error details for both email and password
    const emailResult = emailSchema.validate({email: data.email});
    const passwordResult = passwordSchema.validate({password: data.password});

    if (emailResult.error || passwordResult.error){
        return {
            error: {
                email: emailResult.error ? emailResult.error.details[0].message.replace(/"/g, '') : undefined,
                password: passwordResult.error ? passwordResult.error.details[0].message.replace(/"/g, '') : undefined
            }
        };
    } else return {};
};

const updatePasswordValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().max(64).required().email(),
        oldPassword: Joi.string().max(32).min(10).required(),
        password: Joi.string().max(32).min(10).required()
    });
    return schema.validate(data);
};

const updateNameValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().max(32).required(),
        password: Joi.string().max(32).min(10).required()
    });
    return schema.validate(data);
};

const deleteAccountValidation = (data) => {
    const schema = Joi.object({
        password: Joi.string().max(32).min(10).required()
    });
    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.updatePasswordValidation = updatePasswordValidation;
module.exports.updateNameValidation = updateNameValidation;
module.exports.deleteAccountValidation = deleteAccountValidation;

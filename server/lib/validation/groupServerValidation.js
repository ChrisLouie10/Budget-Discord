const Joi = require('@hapi/joi');

const createServerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(32).required(),
    userId: Joi.string().length(24).required(),
  });
  return schema.validate(data);
};

const createTextChannelValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(32).required(),
    userId: Joi.string().length(24).required(),
    groupServerId: Joi.string().length(24).required(),
  });
  return schema.validate(data);
};

module.exports = {
  createServerValidation,
  createTextChannelValidation,
};

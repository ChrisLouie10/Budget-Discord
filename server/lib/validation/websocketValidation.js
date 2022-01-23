const Joi = require('@hapi/joi');

const messageValidation = (data) => {
  const schema = Joi.object({
    author: Joi.string().length(24).required(),
    content: Joi.string().min(1).max(1000).required(),
    timestamp: Joi.date(),
  });
  return schema.validate(data);
};

module.exports = {
  messageValidation,
};

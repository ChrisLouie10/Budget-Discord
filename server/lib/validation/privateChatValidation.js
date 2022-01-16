const Joi = require('@hapi/joi');

const createPrivateChatValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.string().max(32).required(),
    friendId: Joi.string().max(32).required(),
  });
  return schema.validate(data);
};

const groupServerValidation = (data) => {
  const schema = Joi.object({
    groupServerId: Joi.string().length(24).required(),
  });
  return schema.validate(data);
};

const createTextChannelValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(32).required(),
  });
  return schema.validate(data);
};

module.exports = {
  createPrivateChatValidation,
  groupServerValidation,
  createTextChannelValidation,
};

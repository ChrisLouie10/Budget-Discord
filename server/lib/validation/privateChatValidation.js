const Joi = require('@hapi/joi');

const createPrivateChatValidation = (data) => {
  const schema = Joi.object({
    userId: Joi.string().length(24).required(),
    friendId: Joi.string().length(24).required(),
  });
  return schema.validate(data);
};

const privateChatIdValidation = (data) => {
  const schema = Joi.object({
    privateChatId: Joi.string().length(24).required(),
  });
  return schema.validate(data);
};

module.exports = {
  createPrivateChatValidation,
  privateChatIdValidation,
};

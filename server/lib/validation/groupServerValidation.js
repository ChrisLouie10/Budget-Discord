const Joi = require('@hapi/joi');

const createServerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(32).required(),
    userId: Joi.string().length(24).required(),
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

const chatLogsValidation = (data) => {
  const schema = Joi.object({
    groupServerId: Joi.string().length(24).required(),
    textChannelId: Joi.string().length(24).required(),
  });
  return schema.validate(data);
};

module.exports = {
  createServerValidation,
  groupServerValidation,
  createTextChannelValidation,
  chatLogsValidation,
};

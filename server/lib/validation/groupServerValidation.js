const Joi = require('@hapi/joi');

const createServerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(32).required(),
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

const textChannelValidation = (data) => {
  const schema = Joi.object({
    groupServerId: Joi.string().length(24).required(),
    textChannelId: Joi.string().length(24).required(),
  });
  return schema.validate(data);
};

const inviteValidation = (data) => {
  const schema = Joi.object({
    inviteCode: Joi.string().min(9).max(10).required(),
  });
  return schema.validate(data);
};

const createInviteValidation = (data) => {
  const schema = Joi.object({
    limit: Joi.number().integer().min(-1).max(100)
      .required(),
    expiration: Joi.number().integer().min(-1).max(1440)
      .required(),
  });
  return schema.validate(data);
};

module.exports = {
  createServerValidation,
  groupServerValidation,
  createTextChannelValidation,
  textChannelValidation,
  inviteValidation,
  createInviteValidation,
};

const Joi = require('@hapi/joi');

const findFriendValidation = (data) => {
  const schema = Joi.object({
    friendName: Joi.string().max(32).required(),
    friendNumber: Joi.string().max(4).allow(''),
  });
  return schema.validate(data);
};

const friendIdValidation = (data) => {
  const schema = Joi.object({
    friendID: Joi.string().max(32).required(),
  });
  return schema.validate(data);
};

module.exports = {
  findFriendValidation,
  friendIdValidation,
};

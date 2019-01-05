const Joi = require('joi'),
  _ = require('lodash');

const IdeaSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    title: Joi.string()
      .label('Title')
      .trim()
      .min(3)
      .max(55)
      .required(),
    details: Joi.string()
      .label('Details')
      .trim()
      .min(10)
      .max(5000)
      .required()
  });

module.exports = data => {
  const errors = {};
  const values = {};

  IdeaSchema.validate(data, (error, value) => {
    if (error) {
      ({
        details: [
          {
            message,
            context: { key }
          }
        ]
      } = error);
      errors[key] = message;
      return;
    }

    // Setting the values
    for (const key in value) {
      const element = value[key];
      values[key] = element;
    }
  });

  return {
    errors,
    values,
    isValid: _.isEmpty(errors)
  };
};

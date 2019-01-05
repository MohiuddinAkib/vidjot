const Joi = require('joi'),
  _ = require('lodash');

const UserSchema = Joi.object().keys({
  email: Joi.string()
    .label('Email')
    .min(5)
    .max(255)
    .trim()
    .email()
    .regex(
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    )
    .error(errors => {
      if (errors[0].type === 'string.regex.base') {
        errors[0].message = 'Email must be a valid email';
      }
      return errors;
    })
    .required(),
  password: Joi.string()
    .label('Password')
    .min(6)
    .max(255)
    .trim()
    .required()
});

module.exports = data => {
  const errors = {};
  const values = {};

  UserSchema.validate(data, (error, value) => {
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

const Joi = require('joi'),
  PasswordComplexity = require('joi-password-complexity'),
  _ = require('lodash');

const UserSchema = Joi.object().keys({
  name: Joi.string()
    .label('Name')
    .min(3)
    .max(55)
    .trim()
    .required(),
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
    .required(),
  password_confirmation: Joi.any()
    .label('Confirm password')
    .valid(Joi.ref('password'))
    .required()
    .options({ language: { any: { allowOnly: 'must match password' } } })
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

    const complexityOptions = {
      min: 6,
      max: 255,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
      requirementCount: 4
    };

    // Password complexity
    Joi.validate(
      data.password,
      new PasswordComplexity(complexityOptions),
      err => {
        if (err) {
          errors.password =
            'Password must contain capital letter, small letter, number and symbol';
          return;
        }
      }
    );

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

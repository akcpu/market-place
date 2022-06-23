const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

exports.signUpBodyValidation = (body) => {
  const schema = Joi.object({
    full_name: Joi.string().required().label("Full Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
  });
  return schema.validate(body);
};

exports.logInBodyValidation = (body) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(body);
};

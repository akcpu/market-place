const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const UsersSchema = new Schema({
  full_name: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  roles: {
    type: [String],
    enum: ["user", "admin", "super_admin"],
    default: ["user"],
  },
});

const User = mongoose.model("User", UsersSchema);

const validate = (user) => {
  const schema = Joi.object({
    full_name: Joi.string(),
    email: Joi.string().email().required(),
    newPassword: Joi.string().required(), // you can set .min(5).max(15)
    confirmPassword: Joi.any().valid(Joi.ref("newPassword")).required(),
    "g-recaptcha-response": Joi.string(),
    verified: Joi.boolean().default(false),
    roles: Joi.string().default("user"),
  });
  return schema.validate(user);
};

module.exports = { User, validate };

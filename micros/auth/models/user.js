const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const UsersSchema = new Schema({
  fullName: { type: String, default: null },
  email: { type: String, required: true, trim: true, unique: true },
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
    fullName: Joi.string(),
    email: Joi.string().email().required(),
    newPassword: Joi.string().required().min(5), // you can set .max(15)
    confirmPassword: Joi.any().valid(Joi.ref("newPassword")).required(),
    "g-recaptcha-response": Joi.string().required(),
    verified: Joi.boolean().default(false),
    roles: Joi.string().default("user"),
  });
  return schema.validate(user);
};

module.exports = { User, validate };

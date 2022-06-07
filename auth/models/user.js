const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String },
});

module.exports = User = mongoose.model("user", UsersSchema);

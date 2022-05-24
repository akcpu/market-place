
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  id: {
    type: Number,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

module.exports = Users = mongoose.model('users', UsersSchema);

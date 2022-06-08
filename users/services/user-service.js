const User = require('../models/user');

exports.getUserById = function (userId) {
  return User.findOne({ id: userId });
};
exports.getUsers = function () {
  return User.find();
};

exports.setUser = function (ruser) {
  const newUser = new User({
    id: ruser.id,
    fullName: ruser.fullName,
    userName: ruser.userName,
    password: ruser.password,
    email: ruser.email,
  });
  return newUser.save();
};

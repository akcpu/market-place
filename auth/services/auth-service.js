const User = require("../models/user");

exports.checkExist = function (reqUserName) {
  let userCheck = User.findOne({ userName: reqUserName });
  console.log(userCheck);
  return userCheck;
};

exports.register = function (ruser) {
  const registerUser = new User({
    first_name: ruser.first_name,
    last_name: ruser.last_name,
    userName: ruser.userName,
    email: ruser.email,
    password: ruser.password,
  });
  return registerUser.save();
};

exports.login = function (reqUserName, reqPassword) {
  return User.findOne({ userName: reqUserName, password: reqPassword });
};

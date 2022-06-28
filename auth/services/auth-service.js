const User = require("../models/user");
const Token = require("../models/UserToken");

exports.checkExist = function (reqEmail) {
  let userCheck = User.findOne({ email: reqEmail });
  console.log(userCheck);
  return userCheck;
};

exports.register = function (ruser) {
  const registerUser = new User({
    full_name: ruser.full_name,
    email: ruser.email,
    password: ruser.password,
  });
  return registerUser.save();
};

exports.login = function (reqemail, reqPassword) {
  return User.findOne({ email: reqemail, password: reqPassword });
};

exports.findUserByEmail = function (reqEmail) {
  return User.findOne({ email: reqEmail });
};
exports.findUserById = function (user_id) {
  return User.findOne({ _id: user_id });
};
exports.findToken = function (user_id) {
  return Token.findOne({ userId: user_id });
};
exports.findTokenByuserIdToken = function (user_id, reqToken) {
  return Token.findOne({
    userId: user_id,
    token: reqToken,
  });
};
exports.createToken = function (reqEmail, user_id) {
  const user = User.findOne({ email: reqEmail });
  let token = Token.findOne({ userId: user_id });
  token = new Token({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  }).save();

  return token;
};
exports.vrifyToken = function (user_id, crypto) {
  const token = new Token({
    userId: user_id,
    token: crypto,
  }).save();
  return token;
};

exports.verifyUser = function (user_id, bool) {
  User.updateOne({ _id: user_id, verified: bool });
};

exports.tokenRemove = function (token_id) {
  Token.findByIdAndRemove(token_id);
};

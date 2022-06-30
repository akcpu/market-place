const bcrypt = require("bcrypt");
const { appConfig } = require("../config");
const axios = require("axios");
const { User } = require("../models/user");
//Token const
const UserToken = require("../models/UserToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.hashPassword = function (plainTextPassword) {
  const salt = bcrypt.genSalt(Number(appConfig.SALT));
  const hashPassword = bcrypt.hash(plainTextPassword, salt);
  console.log(hashPassword);

  return hashPassword;
};
exports.getUserDataByEmail = async function (reqEmail) {
  return await User.findOne({ email: reqEmail });
};

exports.checkUserExistById = async function (userId) {
  return await User.findOne({ _id: userId });
};
exports.recaptchaV3 = async function (response_key) {
  // Put secret key here, which we get from google console
  const secret_key = appConfig.recaptchaSecretKey;
  // Hitting POST request to the URL, Google will
  // respond with success or error scenario.
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

  try {
    let result = await axios({
      method: "post",
      url: url,
    });
    let data = result.data || {};
    if (!data.success) {
      console.log("captcha isn't verified!!");
      throw {
        success: false,
        error: "response not valid",
      };
    }
  } catch (err) {
    console.log(err);
    throw err.response
      ? err.response.data
      : { success: false, error: "captcha_error" };
  }
};

exports.createUser = async function (reqfullName, reqEmail, hashPassword) {
  return await new User({
    full_name: reqfullName,
    email: reqEmail,
    password: hashPassword,
  }).save();
};

exports.createVerifyToken = async function (reqUserId) {
  return await new UserToken({
    userId: reqUserId,
    token: crypto.randomBytes(32).toString("hex"),
  }).save();
};

exports.checkTokenExist = async function (reqUserId, ReqToken) {
  return await UserToken.findOne({
    userId: reqUserId,
    token: ReqToken,
  });
};

exports.updateVerifyUser = async function (reqUserId, verified) {
  User.updateOne({ _id: reqUserId }, { verified: verified })
    .then((obj) => {
      console.log("updateOne Updated - " + obj);
      // res.redirect("orders");
    })
    .catch((err) => {
      console.log("updateOne Error: " + err);
    });
};

exports.findByIdAndRemoveToken = async function (tokenId) {
  return await UserToken.findByIdAndRemove(tokenId)
    .then((obj) => {
      console.log("findByIdAndRemove - " + obj);
    })
    .catch((err) => {
      console.log("findByIdAndRemove Error: " + err);
    });
};

exports.checkUserVerify = async function (reqEmail) {
  if (await User.findOne({ email: reqEmail }, { verified: true })) return true;
  else return false;
};

exports.checkPasswordVerify = async function (reqPassword, userPassword) {
  return await bcrypt.compare(reqPassword, userPassword);
};

exports.findUserByAccessToken = async function (token) {
  try {
    const decode = jwt.verify(token, appConfig.accessTPK);
    return User.findById(decode._id);
  } catch (error) {
    return 0;
  }
};

exports.changeUserPasswordByAccessToken = async function (token, reqPassword) {
  try {
    const decode = await jwt.verify(token, appConfig.accessTPK);
    let findUser = await User.findById(decode._id);
    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    const hashPassword = await bcrypt.hash(reqPassword, salt);
    findUser.password = hashPassword;
    findUser.save();
  } catch (error) {
    return 0;
  }
};

exports.getTokenByUserId = async function (reqUserId) {
  return await UserToken.findOne({ userId: reqUserId });
};

exports.createToken = async function (reqUserId) {
  return await new UserToken({
    userId: reqUserId,
    token: crypto.randomBytes(32).toString("hex"),
  }).save();
};

exports.findUserById = async function (user_id) {
  return await User.findOne({ _id: user_id });
};
exports.getUsers = async function () {
  return await User.find();
};
exports.getTokens = async function () {
  return await UserToken.find();
};

exports.saveUser = function (findUser) {
  findUser.save();
};

////////////////////////////////////
// const Token = require("../models/UserToken");
///////////////////////////////

// exports.register = function (ruser) {
//   const registerUser = new User({
//     full_name: ruser.full_name,
//     email: ruser.email,
//     password: ruser.password,
//   });
//   return registerUser.save();
// };

// exports.login = function (reqemail, reqPassword) {
//   return User.findOne({ email: reqemail, password: reqPassword });
// };

// exports.findUserByEmail = function (reqEmail) {
//   return User.findOne({ email: reqEmail });
// };

// exports.findToken = function (user_id) {
//   return Token.findOne({ userId: user_id });
// };
// exports.findTokenByuserIdToken = function (user_id, reqToken) {
//   return Token.findOne({
//     userId: user_id,
//     token: reqToken,
//   });
// };
// exports.createToken = function (reqEmail, user_id) {
//   const user = User.findOne({ email: reqEmail });
//   let token = Token.findOne({ userId: user_id });
//   token = new Token({
//     userId: user._id,
//     token: crypto.randomBytes(32).toString("hex"),
//   }).save();
//   return token;
// };
// exports.verifyToken = function (user_id, crypto) {
//   const token = new Token({
//     userId: user_id,
//     token: crypto,
//   }).save();
//   return token;
// };

// exports.verifyUser = asyncfunction (user_id, bool) {
//   await User.updateOne({ _id: user_id, verified: bool });
// };

// exports.tokenRemove =async function (token_id) {
//   await Token.findByIdAndRemove(token_id);
// };

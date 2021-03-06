const bcrypt = require("bcrypt");
const { appConfig } = require("../config");
const axios = require("axios").default;
const { User } = require("../models/user");
//Token const
const UserToken = require("../models/UserToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const GateKeeper = require("../utils/hmac");

exports.hashPassword = async function (plainTextPassword) {
  const salt = await bcrypt.genSalt(Number(appConfig.SALT));
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
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    throw err.response ? err.response.data : `Error while recaptcha : ${err}`;
  }
};

exports.createUser = async function (reqfullName, reqEmail, hashPassword) {
  return await new User({
    fullName: reqfullName,
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

exports.callAPIWithHMAC = async (method, url, json, userInfo) => {
  const hashData = GateKeeper.sign(
    JSON.stringify(json),
    appConfig.HMAC_SECRET_KEY
  );
  console.log(
    "[INFO][HTTP CALL] callAPIWithHMAC: ",
    "Method: " + method,
    "URL: " + url,
    "Payload: " + JSON.stringify(json),
    "User Info: " + userInfo
  );
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "user-agent": "authToUsers",
    },
  };
  axiosConfig.headers[appConfig.HMAC_HEADER_NAME] = `${hashData.toString()}`;
  await axios
    .post("http://localhost/users", json, axiosConfig)
    .then((data) => {
      console.info(data);
    })
    .catch();
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

exports.changeUserPasswordByAccessToken = async function (
  oldPassword,
  token,
  reqPassword
) {
  try {
    const decode = await jwt.verify(token, appConfig.accessTPK);
    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    let findUser = await User.findById(decode._id);
    if (!bcrypt.compareSync(oldPassword, findUser.password)) {
      throw new Error();
    }
    const hashPassword = await bcrypt.hash(reqPassword, salt);
    findUser.password = hashPassword;
    findUser.save();
  } catch (error) {
    throw new Error(error);
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

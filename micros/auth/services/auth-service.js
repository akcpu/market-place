const bcrypt = require("bcrypt");
const { appConfig } = require("../config");
const axios = require("axios").default;
const { UserAuth } = require("../models/user");

//Token const
const UserToken = require("../models/UserToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const GateKeeper = require("../utils/hmac");
const { validate: uuidValidate } = require("uuid");
const { sendEmail } = require("../utils/sendEmail");

exports.hashPassword = async function (plainTextPassword) {
  const salt = await bcrypt.genSalt(Number(appConfig.SALT));
  const hashPassword = bcrypt.hash(plainTextPassword, salt);
  console.log(hashPassword);

  return hashPassword;
};
exports.FindByUsername = async function (reqEmail) {
  return await UserAuth.findOne({ username: reqEmail });
};

exports.checkUserExistById = async function (objectId, userId) {
  return await UserAuth.findOne({
    objectId: objectId,
    username: userId,
  });
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

exports.createUser = async function (reqUserId, reqEmail, hashPassword) {
  return await new UserAuth({
    objectId: reqUserId,
    username: reqEmail,
    password: hashPassword,
  }).save();
};

exports.CreateEmailVerficationToken = async function (userVerification) {
  if (!uuidValidate(userVerification.UserId)) {
    throw "Error happened in Create Email Verfication Token";
  }
  return await new UserToken({
    objectId: userVerification.UserId,
    code: crypto.randomBytes(32).toString("hex").substring(0, 6),
    userId: userVerification.Username,
    target: userVerification.EmailTo,
    targetType: "email",
    remoteIpAddress: userVerification.RemoteIpAddress,
    // last_updated: Date.now,
    isVerified: false,
    // FullName: userVerification.FullName,
    // HtmlTmplPath: userVerification.HtmlTmplPath,
    // EmailSubject: userVerification.EmailSubject,
    // UserPassword: userVerification.UserPassword,
  }).save();

  // return await new UserToken({
  //   objectId: userVerification.UserId,
  //   userId: userVerification.Username,
  //   target: userVerification.EmailTo,
  //   targetType: { type: String, default: "email" },
  //   remoteIpAddress: userVerification.RemoteIpAddress,
  //   FullName: userVerification.FullName,
  //   HtmlTmplPath: userVerification.HtmlTmplPath,
  //   EmailSubject: userVerification.EmailSubject,
  //   UserPassword: userVerification.UserPassword,

  //   objectId: { type: String, required: true },
  //   code: { type: String, required: true },
  //   target: { type: String, required: true },
  //   counter: { type: Number, required: true },
  //   created_date: { type: Date, default: Date.now, expires: 30 * 86400 }, // 30 days
  //   remoteIpAddress: { type: String, required: true },
  //   userId: { type: String, required: true },
  //   isVerified: { type: Boolean, required: true },
  //   last_updated: { type: Date, default: Date.now, expires: 30 * 86400 }, // 30 days

  //   userId: reqUserId,
  //   token: crypto.randomBytes(32).toString("hex"),
  // }).save();
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
      "user-agent": "authToProfiles",
    },
  };
  axiosConfig.headers[appConfig.HMAC_HEADER_NAME] = `${hashData.toString()}`;
  await axios
    .post("http://localhost/profile/dto/", json, axiosConfig)
    .then((data) => {
      console.info(data);
      return true;
    })
    .catch();
};

exports.getUserProfileByID = async function (reqUserId) {
  const profileURL = `profile/${reqUserId}`;
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "user-agent": "authToProfile",
    },
  };
  await axios
    .get(profileURL)
    .then(function (foundProfile) {
      console.log("foundProfile");
      console.log(foundProfile);
    })
    .catch((err) => {
      //TODO: Expansion of errors
      if (appConfig.Node_ENV === "development") {
        if (err.response) {
          // The client was given an error response (5xx, 4xx)
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else if (err.request) {
          // The client never received a response, and the request was never left
          console.log(err.request);
        } else {
          // Anything else
          console.log("Error", err.message);
        }
      }
      if (err.response.status == 404)
        console.log("NotFoundHTTPStatusError: " + err);

      console.log(`functionCall ${profileURL} -  ${err.message}`);
      return Error("getUserProfileByID/functionCall");
    });
};
exports.checkTokenExist = async function (reqCode) {
  return await UserToken.findOne({ code: reqCode });
};
exports.checkTokenExistByUserId = async function (robjectId, rcode) {
  return await UserToken.findOne({ objectId: robjectId, code: rcode });
};
exports.countExistToken = async function (reqCode) {
  return await UserToken.findOne({ code: reqCode });
};

exports.updateVerifyUser = async function (reqUserId, verified) {
  UserToken.updateOne({ objectId: reqUserId }, { isVerified: verified })
    .then((obj) => {
      console.log("updateOne Updated - " + obj);
      // res.redirect("orders");
    })
    .catch((err) => {
      console.log("updateOne Error: " + err);
    });

  //TODO: PhoneVerfy
  return await UserAuth.updateOne(
    { objectId: reqUserId },
    { emailVerified: verified }
  );
};

exports.updateTokenCounter = async function (tokenId) {
  UserToken.findOne({ objectId: tokenId })
    .then((result) => {
      let count = result.counter + 1;
      return UserToken.updateOne({ objectId: tokenId }, { counter: count });
    })
    .catch((err) => {
      console.log("updateTokenCounter Error: " + err);
    });
};

// exports.checkUserVerify = async function (reqUserName) {
//   if (
//     await UserAuth.findOne(
//       { username: reqUserName },
//       { emailVerified: true } || { phoneVerified: true }
//     )
//   )
//     return true;
//   else return false;
// };

exports.CompareHash = async function (reqPassword, userPassword) {
  return await bcrypt.compare(reqPassword, userPassword);
};

exports.findUserByAccessToken = async function (token) {
  try {
    const decode = jwt.verify(token, appConfig.accessTPK);
    return UserAuth.findOne({ objectId: decode._id });
  } catch (error) {
    throw new Error(error);
  }
};

exports.changeUserPasswordByAccessToken = async function (
  oldPassword,
  token,
  reqPassword
) {
  try {
    const decode = await jwt.verify(token, appConfig.accessTPK);
    console.log(decode);

    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    let findUser = await UserAuth.findOne({ objectId: decode._id });

    console.log(oldPassword);
    console.log(findUser.password);
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

exports.getTokenByUserId = async function (objectId) {
  return await UserToken.findOne({ objectId: objectId });
};

exports.createToken = async function (objectId) {
  await UserToken.findOneAndUpdate(
    { objectId: objectId },
    { code: crypto.randomBytes(32).toString("hex").substring(0, 6) }
  );
  return await UserToken.findOne({ objectId: objectId });
  // return await new UserToken({
  //   objectId: reqUserId,
  //   code: crypto.randomBytes(32).toString("hex"),
  // }).save();
};

exports.findUserById = async function (user_id) {
  return await UserAuth.findOne({ objectId: user_id });
};
exports.getUsers = async function () {
  return await UserAuth.find();
};
exports.getTokens = async function () {
  return await UserToken.find();
};

// add Counter And Last Update
exports.addCounterAndLastUpdate = async (objectId) => {
  UserAuth.findOneAndUpdate({ objectId }, { last_updated: Date.now() });
  return await UserToken.findOneAndUpdate(
    { objectId: objectId },
    { $inc: { counter: 1 }, last_updated: Date.now() }
  );
};

exports.saveUser = function (findUser) {
  findUser.save();
};

const jwt = require("jsonwebtoken");
const UserToken = require("../models/UserToken");
const { appConfig } = require("../config");

// const generateTokens = async (user) => {
//   try {
//     const payload = { _id: user._id, roles: user.roles };
//     const accessToken = jwt.sign(payload, "appConfig.accessTPK", {
//       expiresIn: "14m",
//     });
//     const refreshToken = jwt.sign(payload, appConfig.refreshTPK, {
//       expiresIn: "30d",
//     });

//     const userToken = await UserToken.findOne({ userId: user._id });
//     if (userToken) await userToken.remove();

//     await new UserToken({ userId: user._id, token: refreshToken }).save();
//     return Promise.resolve({ accessToken, refreshToken });
//   } catch (err) {
//     return Promise.reject(err);
//   }
// };

// module.exports.generateTokens = generateTokens;
/////////////////
exports.accessToken = async function (user) {
  const payload = { _id: user._id, roles: user.roles };
  const jwtToken = jwt.sign(payload, appConfig.accessTPK, {
    expiresIn: "14m",
  });
  return jwtToken;
};

exports.refreshToken = async function (user) {
  const payload = { _id: user._id, roles: user.roles };
  const refreshToken = jwt.sign(payload, appConfig.refreshTPK, {
    expiresIn: "30d",
  });
  const userToken = await UserToken.findOne({ userId: user._id });
  if (userToken) await userToken.remove();

  await new UserToken({ userId: user._id, token: refreshToken }).save();

  return refreshToken;
};

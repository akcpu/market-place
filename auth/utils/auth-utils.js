const jwt = require('jsonwebtoken');

exports.createToken = function (
  payload,
  jwtKey,
  jwtalgorithm,
  jwtExpirySeconds
) {
  return jwt.sign({ payload }, jwtKey, {
    algorithm: jwtalgorithm,
    expiresIn: jwtExpirySeconds,
  });
};

exports.verifyToken = function (token, jwtKey) {
  return jwt.verify(token, jwtKey);
};
exports.nowUnixSeconds = function () {
  return Math.round(Number(new Date()) / 1000);
};

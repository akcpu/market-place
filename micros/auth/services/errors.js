const { appConfig } = require("../config");

module.exports = (err, req, res, next) => {
  err.message = err.message || "Internal Server";
  err.code = err.code || "internalServer";
  if (appConfig.Node_ENV == "development") {
    res.json({
      errCode: err.code,
      errMessage: err.message,
      stack: err.stack,
    });
  }
  if (appConfig.Node_ENV == "production") {
    res.json({
      error: { code: err.code, message: err.message },
    });
  }
};

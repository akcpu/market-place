const { appConfig } = require("../config");
const mongoose = require("mongoose");
const log = require("../utils/errorLogger");
const utils = require("../utils/error-handler");

exports.connect = function () {
  mongoose
    .connect(appConfig.DB_URI)
    .then(() => console.info("MongoDB Connected"))
    .catch((err) => {
      log.Error(err);
      throw new utils.ErrorHandler("DBError", "Problem in MongoDB Connection");
    });
};

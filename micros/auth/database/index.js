const { appConfig } = require("../config");
const mongoose = require("mongoose");
const log = require("../utils/errorLogger");
const utils = require("../utils/error-handler");

exports.connect = function () {
  switch (appConfig.DB_TYPE) {
    case "MONGO":
      mongoose
        .connect(appConfig.DB_URI)
        .then(() => console.info("MongoDB Connected"))
        .catch((err) => {
          log.Error(err);
          throw new utils.ErrorHandler(
            "DBError",
            "Problem in MongoDB Connection"
          );
        });
      break;

    default:
      log.Error("Please set valid database type in confing file!");
      throw new utils.ErrorHandler(
        "DBError",
        "Please set valid database type in confing file!"
      );
  }
};

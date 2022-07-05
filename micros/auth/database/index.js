const { appConfig } = require("../config");
const mongoose = require("mongoose");
const log = require("../utils/error-handler");

exports.connect = function () {
  mongoose
    .connect(appConfig.DB_URIp)
    .then(() => console.info("MongoDB Connected"))
    .catch((err) => {
      log.Error(err);

      log.ErrorViewer(
        "Database Error!",
        "Please set valid database type in confing file!"
      );
    });
};

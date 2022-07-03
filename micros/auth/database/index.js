const { appConfig } = require("../config");
const mongoose = require("mongoose");
exports.connect = function () {
  mongoose
    .connect(appConfig.DB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
};

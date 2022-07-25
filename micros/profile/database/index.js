const { appConfig } = require("../config");
const mongoose = require("mongoose");
exports.connect = function () {
  console.log(appConfig.DB_URI);
  mongoose
    .connect(appConfig.DB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
};

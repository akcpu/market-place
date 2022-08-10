require("dotenv").config();
const { appConfig } = require("../config");
const mongoose = require("mongoose");
exports.connect = async () => {
  const connect = await mongoose.connect(appConfig.DB_URI);
  if (!connect) console.log(err);
  console.log("MongoDB Connected");
};

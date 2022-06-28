require("dotenv").config();
exports.appConfig = {
  DB_URI: process.env.mongo_host,
};

require("dotenv").config();

exports.appConfig = {
  host: process.env.mongo_host,
  clientID: process.env.clientID,
  clientSecret: process.env.clientSecret,
};

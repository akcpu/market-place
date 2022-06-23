require("dotenv").config();

exports.appConfig = {
  DB_URI: process.env.mongo_host,
  clientID: process.env.clientID,
  clientSecret: process.env.clientSecret,
  accessTPK: process.env.ACCESS_TOKEN_PRIVATE_KEY,
  refreshTPK: process.env.REFRESH_TOKEN_PRIVATE_KEY,
  SALT: process.env.SALT,
  emailCenter: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailAddress: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASS,
  serviceURL: process.env.BASE_URL,
};

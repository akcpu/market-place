require("dotenv").config();

exports.appConfig = {
  DB_URI: process.env.mongo_host,
  recaptchaSecretKey: process.env.recaptchaSecretKey,
  clientID: process.env.GITclientID,
  clientSecret: process.env.GITclientSecret,
  accessTPK: process.env.ACCESS_TOKEN_PRIVATE_KEY,
  refreshTPK: process.env.REFRESH_TOKEN_PRIVATE_KEY,
  SALT: process.env.SALT,
  emailCenter: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailAddress: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASS,
  serviceURL: process.env.BASE_URL,
  AppURL: process.env.AppURL,
  AppName: process.env.AppName,
  OrgAvatar: process.env.OrgAvatar,
  OrgName: process.env.OrgName,
};

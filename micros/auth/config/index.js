exports.appConfig = {
  DB_URI: process.env.mongo_host,
  recaptchaSiteKey: process.env.recaptchaSiteKey, //reCAPTCHA type:v3 - in the HTML code your site serves to users
  recaptchaSecretKey: process.env.recaptchaSecretKey, //reCAPTCHA type:v3 - for communication between your site and reCAPTCHA
  clientID: process.env.GITclientID,
  clientSecret: process.env.GITclientSecret,
  accessTPK: process.env.ACCESS_TOKEN_PRIVATE_KEY, //Short-lived (minutes) JWT Auth Token
  refreshTPK: process.env.REFRESH_TOKEN_PRIVATE_KEY, //Longer-lived (hours/days) JWT Refresh Token
  SALT: process.env.SALT,
  emailCenter: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailAddress: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASS,
  baseURL: process.env.BASE_URL,
  authServiceURL: process.env.Auth_Service_URL,
  AppURL: process.env.AppURL,
  AppName: process.env.AppName,
  OrgAvatar: process.env.OrgAvatar,
  OrgName: process.env.OrgName,
  Node_ENV: process.env.Node_ENV,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY,
  HMAC_SECRET_KEY: process.env.HMAC_SECRET_KEY,
  HMAC_HEADER_NAME: process.env.HMAC_HEADER_NAME,
};

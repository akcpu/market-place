const express = require("express");
const authRouter = express.Router();
require("../utils/googleOauth");

const {
  SignupPageHandler,
  SignupTokenHandle,
  LoginPageHandler,
  profile,
  logout,
  getResetUserPassword,
  resetUserPassword,
  getForgetPasswordPage,
  forgetPassword,
  getForgetPassword,
  gitCallback,
  gitSuccess,
  getTokens,
  VerifySignupHandle,
  VerifyGetSignupHandle,
  LoginTelarHandler,
  getUsers,
  CheckAdminHandler,
  ChangePasswordHandler,
} = require("../handlers");

//Admin
authRouter.post("/auth/admincheck", CheckAdminHandler);
// authRouter.Post("/auth/adminsignup", AdminSignupHandle);
// authRouter.Post("/auth/adminlogin", LoginAdminHandler);

authRouter.post("/auth/profile", profile);
authRouter.get("/auth/logout", logout);

authRouter.get("/auth/github/callback", gitCallback);
authRouter.get("/auth/gitsuccess", gitSuccess);

authRouter.get("/auth/getUsers", getUsers);
authRouter.get("/auth/getTokens", getTokens);

// Signup
authRouter.get("/auth/signup", SignupPageHandler);
authRouter.post("/auth/signup", SignupTokenHandle);
authRouter.get("/auth/verify", VerifyGetSignupHandle);
authRouter.post("/auth/verify", VerifySignupHandle);

//TODO: verifyAcountBYLink
// authRouter.get("/user/verify/:id/:token", verifyEmailLink);

// Login
authRouter.get("/auth/", LoginPageHandler);
authRouter.post("/auth/", LoginTelarHandler);
authRouter.post("/auth/telar", LoginTelarHandler);

// Password
authRouter.get("/auth/password/reset", getResetUserPassword);
authRouter.post("/auth/password/reset", resetUserPassword);

authRouter.get("/auth/password/forget", getForgetPasswordPage);
authRouter.post("/auth/password/forget", forgetPassword);
authRouter.get("/auth/password/forget/:userId/:token", getForgetPassword);
authRouter.post("/auth/password/change", ChangePasswordHandler);

module.exports = authRouter;

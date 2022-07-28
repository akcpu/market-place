const express = require("express");
const authRouter = express.Router();
require("../utils/googleOauth");

const {
  signupPageHandler,
  signupTokenHandle,
  loginPageHandler,
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
  verifySignupHandle,
  verifyGetSignupHandle,
  loginHandler,
  getUsers,
  checkAdminHandler,
  changePasswordHandler,
} = require("../handlers");

//Admin
authRouter.post("/auth/admincheck", checkAdminHandler);
// authRouter.Post("/auth/adminsignup", adminSignupHandle);
// authRouter.Post("/auth/adminlogin", loginAdminHandler);

authRouter.post("/auth/profile", profile);
authRouter.get("/auth/logout", logout);

authRouter.get("/auth/github/callback", gitCallback);
authRouter.get("/auth/gitsuccess", gitSuccess);

authRouter.get("/auth/getUsers", getUsers);
authRouter.get("/auth/getTokens", getTokens);

// Signup
authRouter.get("/auth/signup", signupPageHandler);
authRouter.post("/auth/signup", signupTokenHandle);
authRouter.get("/auth/verify", verifyGetSignupHandle);
authRouter.post("/auth/verify", verifySignupHandle);

//TODO: verifyAcountBYLink
// authRouter.get("/user/verify/:id/:token", verifyEmailLink);

// Login
authRouter.get("/auth/", loginPageHandler);
authRouter.post("/auth/", loginHandler);
authRouter.post("/auth/telar", loginHandler);

// Password
authRouter.get("/auth/password/reset", getResetUserPassword);
authRouter.post("/auth/password/reset", resetUserPassword);

authRouter.get("/auth/password/forget", getForgetPasswordPage);
authRouter.post("/auth/password/forget", forgetPassword);
authRouter.get("/auth/password/forget/:userId/:token", getForgetPassword);
authRouter.post("/auth/password/change", changePasswordHandler);

module.exports = authRouter;

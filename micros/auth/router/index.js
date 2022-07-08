const express = require("express");
const authRouter = express.Router();

const {
  showSignUp,
  createUserandSendEmail,
  verifyEmailLink,
  logIn,
  getLogIn,
  profile,
  logOut,
  getResetUserPassword,
  resetUserPassword,
  getForgetPasswordPage,
  forgetPassword,
  getForgetPassword,
  gitCallback,
  gitSuccess,
  getUsers,
  getTokens,
} = require("../handlers");

authRouter.get("/auth/signup", showSignUp);
authRouter.post("/auth/signup", createUserandSendEmail);
authRouter.get("/auth/user/verify/:id/:token", verifyEmailLink);
authRouter.get("/auth/login", getLogIn);
authRouter.post("/auth/login", logIn);
authRouter.post("/auth/profile", profile);
authRouter.get("/auth/logout", logOut);

authRouter.get("/auth/reset-password", getResetUserPassword);
authRouter.post("/auth/reset-password", resetUserPassword);

authRouter.get("/auth/forget_password", getForgetPasswordPage);
authRouter.post("/auth/forget_password", forgetPassword);
authRouter.get("/auth/forget_password/:userId/:token", getForgetPassword);

authRouter.get("/auth/github/callback", gitCallback);
authRouter.get("/auth/gitsuccess", gitSuccess);

authRouter.get("/auth/getUsers", getUsers);
authRouter.get("/auth/getTokens", getTokens);

module.exports = authRouter;

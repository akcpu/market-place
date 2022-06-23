const express = require("express");
const authRouter = express.Router();

const {
  signUp,
  createUserandSendEmail,
  verifyEmailLink,
  logIn,
  profile,
  logOut,
  getResetUserPassword,
  resetUserPassword,
  getForgetPasswordPage,
  forgetPassword,
  getForgetPassword,
  github,
  gitCallback,
  gitSuccess,
  getUsers,
  getTokens,
} = require("../handlers");

authRouter.post("/auth/create-user", signUp);
authRouter.post("/auth/signup", createUserandSendEmail);
authRouter.get("/auth/user/verify/:id/:token", verifyEmailLink);
authRouter.post("/auth/login", logIn);
authRouter.post("/auth/profile", profile);
authRouter.get("/auth/logout", logOut);

authRouter.get("/auth/reset-password", getResetUserPassword);
authRouter.post("/auth/reset-password", resetUserPassword);

authRouter.get("/auth/forget_password", getForgetPasswordPage);
authRouter.post("/auth/forget_password", forgetPassword);
authRouter.get("/auth/forget_password/:userId/:token", getForgetPassword);

authRouter.get("/auth/github", github);
authRouter.get("/auth/github/callback", gitCallback);
authRouter.get("/auth/success", gitSuccess);

authRouter.get("/auth/getUsers", getUsers);
authRouter.get("/auth/getTokens", getTokens);

module.exports = authRouter;

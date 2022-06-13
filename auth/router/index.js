const express = require("express");
const authRouter = express.Router();
const {
  login,
  welcome,
  refresh,
  register,
  gitCallback,
  gitSuccess,
  auth,
  github,
} = require("../handlers");

authRouter.post("/auth/register", register);
authRouter.post("/auth/login", login);
authRouter.get("/auth/welcome", welcome);
authRouter.post("/auth/refresh", refresh);
authRouter.get("/auth/github/callback", gitCallback);
authRouter.get("/auth/success", gitSuccess);
authRouter.get("/auth", auth);
authRouter.get("/auth/github", github);

module.exports = authRouter;

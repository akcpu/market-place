const express = require("express");
const authRouter = express.Router();
const auth = require("../services/auth");
const { login, welcome, refresh, register } = require("../handlers");

authRouter.post("/auth/register", register);
authRouter.post("/auth/login", login);
authRouter.get("/auth/welcome", welcome);
authRouter.post("/auth/refresh", refresh);

module.exports = authRouter;

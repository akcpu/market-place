const express = require("express");
const authRouter = express.Router();
const auth = require("../services/auth");
const { login, welcome, refresh, register } = require("../handlers");

authRouter.post("/api/auth/register", register);
authRouter.post("/api/auth/login", login);
authRouter.get("/api/auth/welcome", welcome);
authRouter.post("/api/auth/refresh", refresh);

module.exports = authRouter;

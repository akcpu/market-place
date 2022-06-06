const express = require("express");
const authRouter = express.Router();

const { login } = require("../handlers");

authRouter.post("/api/login", login);

module.exports = authRouter;

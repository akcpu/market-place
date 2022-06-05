const express = require("express");
const userRouter = express.Router();

const { getUsers, getUserById, setUser } = require("../handlers");

userRouter.get("/api/users", getUsers);
userRouter.get("/api/users/:id", getUserById);
userRouter.post("/api/users", setUser);

module.exports = userRouter;

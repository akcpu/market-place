const express = require("express");
const userRouter = express.Router();

const { getUsers, getUserById, setUser } = require("../handlers");

userRouter.get("/users", getUsers);
userRouter.get("/users/:id", getUserById);
userRouter.post("/users", setUser);

module.exports = userRouter;

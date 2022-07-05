const app = require("express")();
const db = require("./database");

const authRouter = require("./router");
app.use(authRouter);

let x = db.connect();
console.log(x);
const cons = require("consolidate");
app.engine("html", cons.mustache);
app.set("view engine", "html");
app.set("views", __dirname + "/views");

module.exports = app;

// const express = require("express");
// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: true }));
// const cookieParser = require("cookie-parser");
// app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// require("express-async-errors");
// const {
//   notFound,
//   errorLogger,
//   errorHandler,
// } = require("./utils/error-handler");

// app.use(notFound);
// app.use(errorHandler);
// app.use(errorLogger);
// app.listen(8092, () => {
//   console.log("Listening to Port ", 8092);
// });

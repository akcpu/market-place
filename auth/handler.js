const app = require("express")();
const db = require("./database");
const authRouter = require("./router");

const express = require("express");
const bodyParser = require("body-parser");

// const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Connect to the database
db.connect();

const cons = require("consolidate");
// assign the mustache engine to .html files
app.engine("html", cons.mustache);
// set .html as the default extension
app.set("view engine", "html");
app.set("views", __dirname + "/views");

// Use the router for the auth routes
app.use(authRouter);
// app.listen(8092, () => {
//   console.log("Listening to Port ", 8092);
// });
module.exports = app;

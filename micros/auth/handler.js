const app = require("express")();
const db = require("./database");
const errorService = require("../../micros/auth/services/errors");
const authRouter = require("./router");
app.use(authRouter);
app.use(errorService);
db.connect();
const cons = require("consolidate");
app.engine("html", cons.mustache);
app.set("view engine", "html");
app.set("views", __dirname + "/views");

module.exports = app;

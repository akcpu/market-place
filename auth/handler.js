const app = require("express")();
const db = require("./database");
const authRouter = require("./router");

// Connect to the database
db.connect();

// const mustache = require('mustache')
const cons = require("consolidate");
// assign the mustache engine to .html files
app.engine("html", cons.mustache);
// set .html as the default extension
app.set("view engine", "html");
app.set("views", __dirname + "/views");
// test mustache

// Use the router for the auth routes
app.use(authRouter);

module.exports = app;

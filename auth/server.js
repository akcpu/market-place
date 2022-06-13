const express = require("express");
const app = express();
app.use(express.json());
const db = require("./database");
db.connect();
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// const mustache = require('mustache')
const cons = require("consolidate");
// assign the mustache engine to .html files
app.engine("html", cons.mustache);
// set .html as the default extension
app.set("view engine", "html");
app.set("views", __dirname + "/views");
// test mustache

///////////////

const authRouter = require("./router");
app.use(authRouter);

app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

const express = require("express");
const app = express();
app.use(express.json());
const { DB_URI } = require("./config");
const mongoose = require("mongoose");
mongoose.connect(DB_URI);
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", function (req, res) {
  return res.send("Hello World...Auth");
});
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

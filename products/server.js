const express = require("express");
const app = express();
app.use(express.json());
const handlers = require("./handlers");
const { DB_URI } = require("./config");
const mongoose = require("mongoose");
mongoose.connect(DB_URI);
app.get("/", function (req, res) {
  return res.send("Hello World...Products");
});
const productRouter = require("./router");
app.use(productRouter);
module.exports = app;
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

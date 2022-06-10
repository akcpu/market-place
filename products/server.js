const express = require("express");
const app = express();
app.use(express.json());
const db = require("./database");
db.connect();
app.get("/", function (req, res) {
  return res.send("Hello World...Products");
});
const productRouter = require("./router");
app.use(productRouter);
module.exports = app;
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

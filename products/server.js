// const mongoose = require("mongoose");
// const app2 = require("./handlers");
// const { APP_CONFIG } = require("./config/index");
// const express = require("express");

// const app = express();

// app.use(express.json());
// const productRouter = require("./router/index");

// app.use(productRouter);
// app.get("/", function (req, res) {
//   return res.send("Hello World....");
// });


// mongoose
//   .connect("mongodb://mongo:27017/market-place-product")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));
// const port = 3001;
// const HOST = "0.0.0.0";
// app.listen(port, HOST);
// module.exports = app;
const express = require('express');
const app = express();
app.use(express.json());
const handlers = require("./handlers");
const { DB_URI } = require("./config");
const mongoose = require('mongoose');
mongoose.connect(DB_URI);
app.get("/", function (req, res) {
    return res.send("Hello World...Products");
  });
const productRouter = require("./router");
app.use(productRouter);
module.exports = app;
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
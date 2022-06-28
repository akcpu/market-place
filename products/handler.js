const app = require("express")();
const db = require("./database");
const productRouter = require("./router");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database
db.connect();

// Use the router for the products routes
app.use(productRouter);

module.exports = app;

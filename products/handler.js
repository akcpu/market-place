const app = require("express")();
const db = require("./database");
const productRouter = require("./router");

// Connect to the database
db.connect();

// Use the router for the products routes
app.use(productRouter);

module.exports = app;
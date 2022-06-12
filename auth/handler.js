const app = require("express")();
const db = require("./database");
const authRouter = require("./router");

// Connect to the database
db.connect();

// Use the router for the auth routes
app.use(authRouter);

module.exports = app;
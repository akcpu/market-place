const app = require("express")();
const db = require("./database");
const errorService = require("../../micros/auth/services/errors");
const authRouter = require("./router");
const session = require("express-session");
const { appConfig } = require("../auth/config");
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: appConfig.SESSION_SECRET_KEY,
  })
);
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", require("../auth/router/googleOauth"));
app.use(authRouter);
app.use(errorService);
db.connect();
const cons = require("consolidate");
app.engine("html", cons.mustache);
app.set("view engine", "html");
app.set("views", __dirname + "/views");

module.exports = app;

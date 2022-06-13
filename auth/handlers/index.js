const { ajv } = require("../validation");
const validate_register = ajv.getSchema("register");
const validate_login = ajv.getSchema("login");
const jwt = require("jsonwebtoken");
const authService = require("../services/auth-service");
const authUtil = require("../utils/auth-utils");
const jwtKey = "my_secret_key";
const jwtExpirySeconds = 300;
const jwtalgorithm = "HS256";

const { appConfig } = require("../config");

////////////////

// Import the axios library, to make HTTP requests
const axios = require("axios");
// This is the client ID and client secret that you obtained
// while registering on github app
const clientID = appConfig.clientID;
const clientSecret = appConfig.clientSecret;
var access_token = "";

// Declare the callback route
exports.gitCallback = (req, res) => {
  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code;

  axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
      accept: "application/json",
    },
  }).then((response) => {
    access_token = response.data.access_token;
    res.redirect("/auth/success");
  });
};

exports.gitSuccess = (req, res) => {
  axios({
    method: "get",
    url: "https://api.github.com/user",
    headers: {
      Authorization: "token " + access_token,
    },
  }).then((response) => {
    var viewdata = { userData: response.data };
    res.render("success", viewdata);
  });
};
require("dotenv").config();
exports.github = (req, res) => {
  var viewdata = { client_id: clientID };
  res.render("index", viewdata);
};

exports.auth = (req, res) => {
  return res.send("Hello World...Auth");
};

// POST /auth/register
exports.register = function (req, res) {
  if (validate_register(req.body)) {
    // Get user input
    const { first_name, last_name, userName, email, password } = req.body;

    // Create user in our Variable
    const newUser = {
      first_name: first_name,
      last_name: last_name,
      userName: userName,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: password,
    };
    authService
      .register(newUser)
      .then((users) => {
        res.send(users);
      })
      .catch((err) => res.status(404).json({ msg: "No user found" + err }));
  } else {
    console.log(validate_register.errors);
    res.status(404).json({
      msg: "No user found" + JSON.stringify(validate_register.errors),
    });
  }
};

exports.login = function (req, res) {
  if (validate_login(req.body)) {
    // Get user input for credentials from JSON body
    const { userName, password } = req.body;

    authService
      .login(userName, password)
      .then((users) => {
        if (users.userName == userName && users.password == password) {
          // Create a new token with the username in the payload
          // and which expires 300 seconds (jwtExpirySeconds Variable) after issue
          const token = authUtil.createToken(
            userName,
            jwtKey,
            jwtalgorithm,
            jwtExpirySeconds
          );

          console.log("token:", token);

          // set the cookie as the token string, with a similar max age as the token
          // here, the max age is in milliseconds, so we multiply by 1000
          res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
          res.send(users);
          res.end();
        } else {
          // return 401 error is username or password doesn't exist, or if password does
          // not match the password in our records
          return res.status(401).end();
        }
      })
      .catch(() => res.status(404).json({ msg: "No user found" }));
  } else {
    console.log(validate_login.errors);
    res.status(404).json({
      msg: "No user found" + JSON.stringify(validate_login.errors),
    });
  }
};

exports.welcome = function (req, res) {
  // We can obtain the session token from the requests cookies, which come with every request
  const token = req.cookies.token;
  console.log("Request token:", token);

  // if the cookie is not set, return an unauthorized error
  if (!token) {
    return res.status(401).end();
  }

  var payload;
  try {
    // Parse the JWT string and store the result in `payload`.
    // Note that we are passing the key in this method as well. This method will throw an error
    // if the token is invalid (if it has expired according to the expiry time we set on sign in),
    // or if the signature does not match
    payload = authUtil.verifyToken(token, jwtKey);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // if the error thrown is because the JWT is unauthorized, return a 401 error
      return res.status(401).end();
    }
    // otherwise, return a bad request error
    return res.status(400).end();
  }

  // Finally, return the welcome message to the user, along with their
  // username given in the token
  res.send(`Welcome ${Object.values(payload)[0]}!`);
};

exports.refresh = function (req, res) {
  // (BEGIN) The code uptil this point is the same as the first part of the `welcome` route
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).end();
  }

  var payload;
  try {
    payload = authUtil.verifyToken(token, jwtKey);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).end();
    }
    return res.status(400).end();
  }
  // (END) The code uptil this point is the same as the first part of the `welcome` route

  // We ensure that a new token is not issued until enough time has elapsed
  // In this case, a new token will only be issued if the old token is within
  // 30 seconds of expiry. Otherwise, return a bad request status
  const nowUnixSeconds = authUtil.nowUnixSeconds;
  if (Object.values(payload)[2] - nowUnixSeconds > 30) {
    return res.status(400).end();
  }

  const createToken = authUtil.createToken(
    Object.values(payload)[0],
    jwtKey,
    jwtalgorithm,
    jwtExpirySeconds
  );

  // Set the new token as the users `token` cookie
  res.cookie("token", createToken, { maxAge: jwtExpirySeconds * 1000 });
  res.end();
};

// exports.github_OAth2 = function (req, res) {
//   res.render("index", {
//     locals: {
//       title: "Welcome",
//     },
//   });
// };

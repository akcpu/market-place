const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authService = require("../services/auth-service");

const jwtKey = "my_secret_key";
const jwtExpirySeconds = 300;

// POST /auth/register
exports.register = function (req, res) {
  // Get user input
  const { first_name, last_name, userName, email, password } = req.body;

  // Validate user input
  if (!(email && password && first_name && last_name && userName)) {
    res.status(400).send("All input is required");
  }

  // Create user in our Variable
  try {
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
  } catch (error) {
    throw error;
  }
};

exports.login = function (req, res) {
  // Get user input for credentials from JSON body
  const { userName, password } = req.body;

  // Validate user input
  if (!(userName && password)) {
    res.status(400).send("All input is required");
  }

  try {
    authService
      .login(userName, password)
      .then((users) => {
        if (users.userName == userName && users.password == password) {
          // Create a new token with the username in the payload
          // and which expires 300 seconds after issue
          const token = jwt.sign({ userName }, jwtKey, {
            algorithm: "HS256",
            expiresIn: jwtExpirySeconds,
          });
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
      .catch((err) => res.status(404).json({ msg: "No user found" }));
  } catch (error) {
    throw error;
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
    payload = jwt.verify(token, jwtKey);
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
  res.send(`Welcome ${payload.userName}!`);
};

exports.refresh = function (req, res) {
  // (BEGIN) The code uptil this point is the same as the first part of the `welcome` route
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).end();
  }

  var payload;
  try {
    payload = jwt.verify(token, jwtKey);
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
  const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
  if (payload.exp - nowUnixSeconds > 30) {
    return res.status(400).end();
  }

  // Now, create a new token for the current user, with a renewed expiration time
  const newToken = jwt.sign({ username: payload.username }, jwtKey, {
    algorithm: "HS256",
    expiresIn: jwtExpirySeconds,
  });

  // Set the new token as the users `token` cookie
  res.cookie("token", newToken, { maxAge: jwtExpirySeconds * 1000 });
  res.end();
};

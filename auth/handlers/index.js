const { appConfig } = require("../config");
const axios = require("axios");
const clientID = appConfig.clientID;
const clientSecret = appConfig.clientSecret;
var access_token = "";
require("dotenv").config();
const bcrypt = require("bcrypt");
//Auth const
const {
  signUpBodyValidation,
  logInBodyValidation,
} = require("../utils/validationSchema");
// const User = require("../models/User");
const generateTokens = require("../utils/generateTokens");
//Token const
const UserToken = require("../models/UserToken");
const jwt = require("jsonwebtoken");
const { User, validate } = require("../models/user");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const Joi = require("joi");
// const nodemailer = require("nodemailer");

// signup
exports.signUp = async (req, res) => {
  try {
    const { error } = signUpBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(400)
        .json({ error: true, message: "User with given email already exist" });

    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await new User({ ...req.body, password: hashPassword }).save();

    res.status(201).json({
      error: false,
      message:
        "Account created sucessfully" +
        "salt: " +
        salt +
        "hashPassword: " +
        hashPassword,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
// create user and send email
exports.createUserandSendEmail = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send("User with given email already exist!");

    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    user = await new User({
      full_name: req.body.full_name,
      email: req.body.email,
      password: hashPassword,
    }).save();

    let token = await new UserToken({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const link = `${appConfig.serviceURL}/user/verify/${user.id}/${token.token}`;
    //res.render(__dirname + "/views/layouts/main.html", { name: name });
    await sendEmail(user.email, "Verify Email", "email_code_verify-css", link);
    res.send("An Email sent to your account please verify");
  } catch (error) {
    res.status(400).send("error: " + error + "An error occured");
  }
};

// verify link sent by email
exports.verifyEmailLink = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await UserToken.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link");

    User.updateOne({ _id: user._id }, { verified: true })
      .then((obj) => {
        console.log("updateOne Updated - " + obj);
        // res.redirect("orders");
      })
      .catch((err) => {
        console.log("updateOne Error: " + err);
      });

    await UserToken.findByIdAndRemove(token._id)
      .then((obj) => {
        console.log("findByIdAndRemove - " + obj);
        // res.redirect("orders");
      })
      .catch((err) => {
        console.log("findByIdAndRemove Error: " + err);
      });

    res.send("email verified sucessfully");
  } catch (error) {
    res.status(400).send("An error occured");
  }
};

// login
exports.logIn = async (req, res) => {
  try {
    const { error } = logInBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password" });

    const verifiedUser = await User.findOne(
      { email: req.body.email },
      { verified: true }
    );
    if (!verifiedUser)
      return res.status(401).json({ error: true, message: "Unverified email" });

    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const verifiedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!verifiedPassword)
      return res.status(401).json({
        error: true,
        message:
          "Invalid email or password!!" +
          "req.body.password: " +
          req.body.password +
          "hashPassword: " +
          hashPassword +
          "user.password: " +
          user.password,
      });

    res.cookie("token", await generateTokens.accessToken(user));
    const refreshToken = await generateTokens.refreshToken(user);

    // const tokenauthorization = req.headers.authorization.split(" ");
    res.status(200).json({
      error: false,
      refreshToken,
      message: "Logged in sucessfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

exports.profile = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).end();
  }
  const decode = await jwt.verify(token, appConfig.accessTPK);
  const findUser = await User.findById(decode._id);
  if (!findUser) {
    return res.status(401).end();
  }
  const { _id, full_name, email, password, verified, roles } = findUser;
  res.status(200).json({
    error: false,
    message:
      "username: " +
      "_id: " +
      _id +
      "full_name: " +
      full_name +
      "email: " +
      email +
      "password: " +
      password +
      "verified: " +
      verified +
      roles +
      "Access successfully",
  });
};

exports.logOut = async (req, res) => {
  res.clearCookie("token").end;
  res.status(200).json({
    error: false,
    message: "User LogOut successfully",
  });
};

// Get Change password Page
exports.getResetUserPassword = async (req, res) => {
  var viewdata = {
    AppName: "AppName",
    LoginLink: "login",
    OrgName: "OrgName",
    Title: "Title",
    OrgAvatar: "OrgAvatar",
    ActionForm: "reset-password",
  };
  res.render("reset_password", viewdata);
};

// Change User password
exports.resetUserPassword = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).end();
  }
  const decode = await jwt.verify(token, appConfig.accessTPK);
  const findUser = await User.findById(decode._id);
  if (!findUser) {
    return res.status(401).end();
  }
  const { _id, full_name, email, password, verified, roles } = findUser;
  res.status(200).json({
    error: false,
    message:
      "username: " +
      "_id: " +
      _id +
      "full_name: " +
      full_name +
      "email: " +
      email +
      "password: " +
      password +
      "verified: " +
      verified +
      roles +
      "Access successfully",
  });

  try {
    const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    findUser.password = hashPassword;
    await findUser.save();
    await token.delete();

    res.send("change password sucessfully.");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

// Forget password Page
exports.getForgetPasswordPage = async (req, res) => {
  var viewdata = {
    AppName: "AppName",
    LoginLink: "login",
    OrgName: "OrgName",
    Title: "Title",
    OrgAvatar: "OrgAvatar",
    ActionForm: "/auth/password-reset/",
  };
  res.render("forget_password", viewdata);
};

// Send reset password link
exports.forgetPassword = async (req, res) => {
  try {
    const schema = Joi.object({ email: Joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

    let token = await UserToken.findOne({ userId: user._id });
    if (!token) {
      token = await new UserToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${appConfig.serviceURL}/password-reset/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password reset", link);
    res.send("password reset link sent to your email account");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

// Forget password
exports.getForgetPassword = async (req, res) => {
  let requserId = req.params.userId;
  let reqToken = req.params.token;
  try {
    const user = await User.findOne({ _id: requserId });
    if (!user) return res.status(400).send("Invalid link");

    const token = await UserToken.findOne({
      userId: user._id,
      token: reqToken,
    });
    if (!token) return res.status(400).send("Invalid link");

    await UserToken.findByIdAndRemove(token._id)
      .then((obj) => {
        console.log("findByIdAndRemove - " + obj);
      })
      .catch((err) => {
        console.log("findByIdAndRemove Error: " + err);
      });
    res.cookie("token", await generateTokens.accessToken(user));

    var viewdata = {
      AppName: "AppName",
      LoginLink: "login",
      OrgName: "OrgName",
      Title: "Title",
      OrgAvatar: "OrgAvatar",
      ActionForm: "/auth/password-reset/",
    };
    res.render("reset_password", viewdata);

    res.send("Passwrd Changed sucessfully" + token).end;
  } catch (error) {
    res.status(400).send("An error occured");
    console.log(error);
  }
};

// show Github login page
exports.github = (req, res) => {
  var viewdata = { client_id: clientID };
  res.render("index", viewdata);
};

// Declare the callback github route
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

// Github Authorization Successfully
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

// Show all Users
exports.getUsers = async (_req, res) => {
  await User.find()
    .then((users) => res.send(users))
    .catch(() => res.status(404).json({ msg: "No user found" }));
};
// Show all Tokens
exports.getTokens = async (_req, res) => {
  await UserToken.find()
    .then((tokens) => res.send(tokens))
    .catch(() => res.status(404).json({ msg: "No token found" }));
};

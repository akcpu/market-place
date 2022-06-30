const { appConfig } = require("../config");
const authService = require("../services/auth-service");
const { sendEmail } = require("../utils/sendEmail");
const axios = require("axios");
var access_token = "";
require("dotenv").config();
// const bcrypt = require("bcrypt");
//Auth const
const {
  signUpBodyValidation,
  logInBodyValidation,
} = require("../utils/validationSchema");
const generateTokens = require("../utils/generateTokens");

// const User = require("../models/User");
const { User, validate } = require("../models/user");
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

    let user = await authService.getUserDataByEmail(req.body.email);
    // const user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(400)
        .json({ error: true, message: "User with given email already exist" });

    // const salt = await bcrypt.genSalt(Number(appConfig.SALT));
    // const hashPassword = await bcrypt.hash(req.body.password, salt);
    const hashPassword = await authService.hashPassword(req.body.password);
    await new User({ ...req.body, password: hashPassword }).save();

    res.status(201).json({
      error: false,
      message:
        "Account Creation Error" +
        "user:" +
        user +
        "hashPassword: " +
        hashPassword,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// Get SignUp Page
exports.showSignUp = async (req, res) => {
  var viewdata = {
    AppName: appConfig.AppName,
    LoginLink: "/auth/login",
    OrgName: appConfig.OrgName,
    Title: "Create User",
    OrgAvatar: appConfig.OrgAvatar,
    ActionForm: "/auth/signup",
    SiteKey: appConfig.recaptchaSiteKey,
  };
  res.render("signup", viewdata);
};

// create user and send email
exports.createUserandSendEmail = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    await authService.recaptchaV3(req.body["g-recaptcha-response"]);

    let user = await authService.getUserDataByEmail(req.body.email);
    if (user)
      return res.status(400).send("User with given email already exist!");

    const hashPassword = await authService.hashPassword(req.body.newPassword);

    user = await authService.createUser(
      req.body.full_name,
      req.body.email,
      hashPassword
    );

    let verifyToken = await authService.createVerifyToken(user._id);

    const link = `${appConfig.serviceURL}/user/verify/${user.id}/${verifyToken.token}`;
    await sendEmail(
      user.full_name,
      user.email,
      "Verify Email, " + user.full_name,
      link,
      "email_code_verify-css",
      link
    );

    var viewdata = {
      Message: "An Email sent to your account please verify.",
    };
    res.render("message", viewdata);
  } catch (error) {
    res.status(400).send("error: " + error + "An error occured");
  }
};

// verify link sent by email
exports.verifyEmailLink = async (req, res) => {
  try {
    const user = await authService.checkUserExistById(req.params.id);
    if (!user) return res.status(400).send("Invalid link");

    const token = await authService.checkTokenExist(user._id, req.params.token);
    if (!token) return res.status(400).send("Invalid link");

    await authService.updateVerifyUser(user._id, true);
    await authService.findByIdAndRemoveToken(token._id);

    var viewdata = {
      Message: "email verified sucessfully",
    };
    res.render("message", viewdata);
  } catch (error) {
    res.status(400).send("An error occured");
  }
};

exports.getLogIn = async (req, res) => {
  let gitClientID = appConfig.clientID
    ? "https://github.com/login/oauth/authorize?client_id=" + appConfig.clientID
    : "";

  var viewdata = {
    AppName: appConfig.AppName,
    OrgName: appConfig.OrgName,
    ActionForm: "/auth/login",
    Message: "You Can Signin To the Website",
    ResetPassLink: "/auth/forget_password",
    SignupLink: "/auth/signup",
    GithubLink: gitClientID,
    Title: "signup",
    OrgAvatar: appConfig.OrgAvatar,
  };
  res.render("login", viewdata);
};

// POST login
exports.logIn = async (req, res) => {
  try {
    const { error } = logInBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    const user = await authService.getUserDataByEmail(req.body.username);
    if (!user)
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password" });

    const checkUserVerify = await authService.checkUserVerify(
      req.body.username
    );
    if (!checkUserVerify)
      return res.status(401).json({ error: true, message: "Unverified email" });
    // const hashPassword = await authService.hashPassword(req.body.password);

    const checkPasswordVerify = await authService.checkPasswordVerify(
      req.body.password,
      user.password
    );

    if (!checkPasswordVerify)
      return res.status(401).json({
        error: true,
        message: "Invalid email or password!!",
      });

    // If you request a user login with a user role,
    // use the refresh Token to log in, and other roles must use accessToken
    res.cookie("token", await generateTokens.accessToken(user));
    const refreshToken = await generateTokens.refreshToken(user);
    res.cookie("refreshToken", refreshToken);
    // use headers authorization
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
  const findUser = authService.findUserByAccessToken(token);
  if (!findUser) {
    return res.status(401).end();
  }

  const { _id, full_name, email, password, verified, roles } = findUser;
  res.status(200).json({
    error: false,
    message:
      "username: " +
      full_name +
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

  // const salt = await bcrypt.genSalt(Number(appConfig.SALT));
  // const hashPassword = await bcrypt.hash("123456789", salt);

  // const doc = await User.findById(decode._id);
  // doc.full_name = "reza";
  // doc.password = hashPassword;
  // await doc.save();

  // res.status(200).json({
  //   error: false,
  //   message:
  //     "username: " +
  //     doc.full_name +
  //     "password: " +
  //     doc.password +
  //     "Change successfully",
  // });
};

exports.logOut = async (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("token");
  res.status(200).json({
    error: false,
    message: "User LogOut successfully",
  });
};

// Get Change password Page
exports.getResetUserPassword = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).end();
  }
  const findUser = await authService.findUserByAccessToken(token);
  if (!findUser) {
    return res.status(401).end();
  }

  var viewdata = {
    AppName: appConfig.AppName,
    ActionForm: "/auth/reset-password/",
    LoginLink: "/auth/login",
    OrgName: appConfig.OrgName,
    Title: "Reset User Password",
    OrgAvatar: appConfig.OrgAvatar,
  };
  res.render("reset_password", viewdata);
};

// Change User password
exports.resetUserPassword = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).end();
    }
    console.log("token: " + token);
    const findUser = authService.changeUserPasswordByAccessToken(
      token,
      req.body.newPassword
    );
    if (!findUser) {
      return res.status(401).end();
    }

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    var viewdata = {
      Message: "change password sucessfully.",
    };
    res.render("message", viewdata);
  } catch (error) {
    console.log(error);
    res.send("An error occured");
  }
};

// Forget password Page
exports.getForgetPasswordPage = async (req, res) => {
  var viewdata = {
    AppName: appConfig.AppName,
    LoginLink: "auth/login",
    OrgName: appConfig.AppName,
    Title: "Forget Password",
    OrgAvatar: appConfig.OrgAvatar,
    ActionForm: "/auth/forget_password/",
  };
  res.render("forget_password", viewdata);
};

// Send reset password link
exports.forgetPassword = async (req, res) => {
  try {
    const schema = Joi.object({ email: Joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await authService.getUserDataByEmail(req.body.email);
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

    let token = await authService.getTokenByUserId(user._id);
    if (!token) token = await authService.createToken(user._id);
    console.log(token);
    const link = `${appConfig.authServiceURL}/forget_password/${user._id}/${token.token}`;

    await sendEmail(
      user.full_name,
      user.email,
      "Password reset, " + user.full_name,
      link,
      "email_link_verify_reset_pass-css",
      link
    );

    var viewdata = {
      Message: "password reset link sent to your email account",
    };
    res.render("message", viewdata);
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

// Forget password
exports.getForgetPassword = async (req, res) => {
  let reqUserId = req.params.userId;
  let reqToken = req.params.token;
  try {
    const user = await authService.findUserById(reqUserId);
    if (!user) return res.status(400).send("Invalid link");

    const token = await authService.checkTokenExist(user._id, reqToken);
    if (!token) return res.status(400).send("Invalid link");

    await authService.findByIdAndRemoveToken(token._id);
    res.cookie("token", await generateTokens.accessToken(user));

    var viewdata = {
      AppName: appConfig.AppName,
      ActionForm: "/auth/reset-password/",
      LoginLink: "/auth/login",
      OrgName: appConfig.OrgName,
      Title: "Forget Password",
      OrgAvatar: appConfig.OrgAvatar,
    };
    res.render("reset_password", viewdata);
    // res.redirect("/auth/reset-password");
    // res.send("Passwrd Changed sucessfully" + token).end;
  } catch (error) {
    res.status(400).send("An error occured");
    console.log(error);
  }
};

// Declare the callback github route
exports.gitCallback = (req, res) => {
  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code;
  axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${appConfig.clientID}&client_secret=${appConfig.clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
      accept: "application/json",
    },
  }).then((response) => {
    access_token = response.data.access_token;
    res.redirect("/auth/gitsuccess");
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
  await authService
    .getUsers()
    .then((users) => res.send(users))
    .catch(() => res.status(404).json({ msg: "No user found" }));
};
// Show all Tokens
exports.getTokens = async (_req, res) => {
  await authService
    .getTokens()
    .then((tokens) => res.send(tokens))
    .catch(() => res.status(404).json({ msg: "No token found" }));
};

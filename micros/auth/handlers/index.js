const { appConfig } = require("../config");
const authService = require("../services/auth-service");
const { sendEmail } = require("../utils/sendEmail");
const axios = require("axios");
const zxcvbn = require("zxcvbn");
const bcrypt = require("bcrypt");
var access_token = "";

//Auth const
const {
  signUpBodyValidation,
  logInBodyValidation,
} = require("../utils/validationSchema");
const generateTokens = require("../utils/generateTokens");

const { User, validate } = require("../models/user");
const Joi = require("joi");

const log = require("../utils/errorLogger");
const utils = require("../utils/error-handler");
const { HttpStatusCode } = require("../utils/HttpStatusCode");

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
  const { error } = validate(req.body);
  if (error) {
    log.Error("SignupTokenHandle: missing validation");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "auth.missingvalidation",
          "Missing validation"
        ).json()
      );
  }
  const passStrength = await zxcvbn(req.body.newPassword);
  log.Error(
    `User With Email: ${req.body.email} Password Strength is: ${passStrength.score} and ${passStrength.crack_times_display.online_no_throttling_10_per_second} crack time estimations`
  );
  if (passStrength.guesses < 37) {
    log.Error(
      ` *** WARNING *** - User With Email: ${req.body.email} Password Strength is: ${passStrength.guesses}`
    );

    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "auth.needStrongerPassword",
          "Password is not strong enough!"
        ).json()
      );
  }

  // Verify Captha
  let recaptchaV3 = await authService.recaptchaV3(
    req.body["g-recaptcha-response"]
  );
  if (!recaptchaV3.success || !recaptchaV3) {
    log.Error("Error happened in validating recaptcha!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "internal/recaptcha",
          "Error happened in verifying captcha!"
        ).json()
      );
  }

  // Check user exist
  let user = await authService.getUserDataByEmail(req.body.email);

  if (user) {
    log.Error("User already exist by email : " + user);
    return res
      .status(HttpStatusCode.Conflict)
      .send(
        new utils.ErrorHandler(
          "auth.userAlreadyExist",
          "User already exist - " + req.body.email
        ).json()
      );
  }
  const salt = await bcrypt.genSalt(Number(appConfig.SALT));
  const hashPassword = await bcrypt.hash(req.body.newPassword, salt);
  let userData = await authService.createUser(
    req.body.fullName,
    req.body.email,
    hashPassword
  );

  if (!userData) {
    log.Error("Error happened in creating User Information");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.createUser",
          "Error happened in creating User Information! - " + req.url
        ).json()
      );
  }
  const postData = {};
  postData.id = userData.id;
  postData.fullName = userData.fullName;
  postData.email = userData.email;
  postData.password = hashPassword;
  postData.userName = userData.email;

  authService.callAPIWithHMAC("POST", req.url, postData, userData);

  let verifyToken = await authService.createVerifyToken(userData.id);

  const link = `${appConfig.authServiceURL}/user/verify/${userData.id}/${verifyToken.token}`;
  await sendEmail(
    userData.fullName,
    userData.email,
    "Verify Email, " + userData.fullName,
    link,
    "email_code_verify-css",
    link
  ).catch(() => {
    log.Error("Error happened in sending Email!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "internal/sendEmailAuth",
          "Error happened in sending email! - " + req.body.email
        ).json()
      );
  });

  var viewdata = {
    Message: "An Email sent to your account please verify.",
  };
  res.render("message", viewdata);
};

// verify link sent by email
exports.verifyEmailLink = async (req, res) => {
  const user = await authService.checkUserExistById(req.params.id);
  if (!user) {
    log.Error("verifyEmailHandle: Error happened in show verify Email Link!");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.userverifactionmissing",
          "User exist missing"
        ).json()
      );
  }

  const token = await authService.checkTokenExist(user._id, req.params.token);
  if (!token) {
    log.Error("verifyEmailHandle: Error happened in check token exist");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.tokenverifactionmissing",
          "Token exist missing"
        ).json()
      );
  }

  await authService.updateVerifyUser(user._id, true);
  await authService.findByIdAndRemoveToken(token._id);

  var viewdata = {
    Message: "email verified sucessfully",
  };
  res.render("message", viewdata);
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
    GoogleLink: "/auth/google",
    Title: "Login",
    OrgAvatar: appConfig.OrgAvatar,
  };
  res.render("login", viewdata);
};

// POST login
exports.logIn = async (req, res) => {
  const { error } = logInBodyValidation(req.body);
  if (error) {
    log.Error("LoginHandle: missing validation");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "auth.loginmissingvalidation",
          "Missing validation"
        ).json()
      );
  }
  const user = await authService.getUserDataByEmail(req.body.username);
  if (!user) {
    log.Error("LoginHandle: Invalid email or password");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.loginInvalid",
          "Invalid email or password"
        ).json()
      );
  }
  const checkUserVerify = await authService.checkUserVerify(req.body.username);
  if (!checkUserVerify) {
    log.Error("LoginHandle: Unverified email");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.loginunverifiedemail",
          "Unverified email"
        ).json()
      );
  }
  const checkPasswordVerify = await authService.checkPasswordVerify(
    req.body.password,
    user.password
  );

  if (!checkPasswordVerify) {
    log.Error("LoginHandle: Invalid email or password");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.loginInvalid",
          "Invalid email or password"
        ).json()
      );
  }

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

  const { _id, fullName, email, password, verified, roles } = findUser;
  res.status(200).json({
    error: false,
    message:
      "username: " +
      fullName +
      "_id: " +
      _id +
      "full name: " +
      fullName +
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
  // doc.fullName = "reza";
  // doc.password = hashPassword;
  // await doc.save();

  // res.status(200).json({
  //   error: false,
  //   message:
  //     "username: " +
  //     doc.fullName +
  //     "password: " +
  //     doc.password +
  //     "Change successfully",
  // });
};

exports.logOut = async (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({
    error: false,
    message: "User LogOut successfully",
  });
};

// Get Change password Page
exports.getResetUserPassword = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    log.Error("ResetPassHandle: Authentication Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.missingloginAuth",
          "Missing Authentication"
        ).json()
      );
  }
  const findUser = await authService.findUserByAccessToken(token);
  if (!findUser) {
    log.Error("ResetPassHandle: Find User Problem");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.missingloginFind",
          "Missing Find User"
        ).json()
      );
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
      log.Error("ResetPassHandle: Authentication Problem");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "auth.missingloginAuth",
            "Missing Authentication"
          ).json()
        );
    }
    await authService
      .changeUserPasswordByAccessToken(
        req.body.oldPassword,
        token,
        req.body.newPassword
      )
      .then(() => {
        res.clearCookie("token");
        res.clearCookie("refreshToken");

        var viewdata = {
          Message: "change password sucessfully.",
        };
        res.render("message", viewdata);
      })
      .catch(() => {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        log.Error("ResetPassHandle: Find User Problem");
        return res
          .status(HttpStatusCode.Unauthorized)
          .send(
            new utils.ErrorHandler(
              "missingResetPassword",
              "Missing Reset Password"
            ).json()
          );
      });
  } catch (error) {
    console.log(error);
    res.send("An error occured");
  }
};

// Forget password Page
exports.getForgetPasswordPage = async (req, res) => {
  var viewdata = {
    AppName: appConfig.AppName,
    LoginLink: "/auth/login",
    OrgName: appConfig.AppName,
    Title: "Forget Password",
    OrgAvatar: appConfig.OrgAvatar,
    ActionForm: "/auth/forget_password/",
  };
  res.render("forget_password", viewdata);
};

// Send reset password link
exports.forgetPassword = async (req, res) => {
  if (req.body.email == "") {
    log.Error("ForgetPassHandle: email field is empty");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler("auth.missingEmail", "Missing Email").json()
      );
  }

  const schema = Joi.object({ email: Joi.string().email().required() });
  const { error } = schema.validate(req.body);
  if (error) {
    log.Error("ForgetPassHandle: email field is empty");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "forgetpassmissingvalidation",
          "Missing validation"
        ).json()
      );
  }

  const user = await authService.getUserDataByEmail(req.body.email);
  if (user) {
    log.Error("ForgetPassHandle : User already exist by email : %s", user);
    return res
      .status(HttpStatusCode.Conflict)
      .send(
        new utils.ErrorHandler(
          "forgetAlreadyExist",
          "User already exist - " + req.body.email
        ).json()
      );
  }

  let token = await authService.getTokenByUserId(user._id);
  if (!token) token = await authService.createToken(user._id);
  console.log(token);
  const link = `${appConfig.authServiceURL}/forget_password/${user._id}/${token.token}`;

  let sendMail = false;
  sendMail = await sendEmail(
    user.fullName,
    user.email,
    "Password reset, " + user.fullName,
    link,
    "email_link_verify_reset_pass-css",
    link
  );
  if (!sendMail) {
    log.Error("Error happened in sending Email!");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "internal/sendEmailAuth",
          "Error happened in sending email! - " + req.body.email
        ).json()
      );
  }
  var viewdata = {
    Message: "password reset link sent to your email account",
  };
  res.render("message", viewdata);
};

// Forget password
exports.getForgetPassword = async (req, res) => {
  let reqUserId = req.params.userId;
  let reqToken = req.params.token;
  if (!reqUserId || !reqToken) {
    log.Error("ForgetPassHandle: Input Value Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler("auth.missinginput", "Missing Value").json()
      );
  }

  const user = await authService.findUserById(reqUserId);
  if (!user) {
    log.Error("ForgetPassHandle: find user Problem");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "missingforgetfinduser",
          "Missing find forget user"
        ).json()
      );
  }

  const token = await authService.checkTokenExist(user._id, reqToken);
  if (!token) {
    log.Error("ForgetPassHandle: user Token Problem");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.missingforgettoken",
          "Missing Token forget user"
        ).json()
      );
  }

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
  })
    .then((response) => {
      access_token = response.data.access_token;
      res.redirect("/auth/gitsuccess");
    })
    .catch((err) => {
      log.Error(`GithubHandle: callback Problem ${err}`);
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "auth.missinggitCallback",
            "Missing Callback Github"
          ).json()
        );
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
  })
    .then((response) => {
      var viewdata = { userData: response.data };
      res.render("success", viewdata);
    })
    .catch((err) => {
      log.Error(`GithubHandle: response Github Authorization Problem ${err}`);
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "auth.missinggitAuth",
            "Missing Authorization Github"
          ).json()
        );
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

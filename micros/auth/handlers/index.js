const { appConfig } = require("../config");
const authService = require("../services/auth.service");
const { sendEmail } = require("../utils/sendEmail");
const axios = require("axios");
const zxcvbn = require("zxcvbn");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
var access_token = "";

//Auth const
const {
  signUpBodyValidation,
  logInBodyValidation,
} = require("../utils/validationSchema");
const generateTokens = require("../utils/generateTokens");

const Joi = require("joi");

const log = require("../utils/errorLogger");
const utils = require("../utils/error-handler");
const { HttpStatusCode } = require("../utils/HttpStatusCode");

// SignupPageHandler creates a handler for logging in
exports.signupPageHandler = async (req, res) => {
  var viewData = {
    Title: "Create User",
    OrgName: appConfig.OrgName,
    OrgAvatar: appConfig.OrgAvatar,
    AppName: appConfig.AppName,
    ActionForm: "/auth/signup",
    LoginLink: "/auth/login",
    RecaptchaKey: appConfig.recaptchaSiteKey,
    VerifyType: appConfig.VerifyType,
  };
  res.render("signup", viewData);
};

// SignupTokenHandle create signup token
exports.signupTokenHandle = async (req, res) => {
  // TODO: Validation Implation
  // const { error } = UserAuthValidate(req.body);
  // if (error) {
  //   log.Error(error);
  //   log.Error("signupTokenHandle: missing validation");
  //   return res
  //     .status(HttpStatusCode.BadRequest)
  //     .send(
  //       new utils.ErrorHandler(
  //         "auth.missingvalidation",
  //         "Missing validation"
  //       ).json()
  //     );
  // }
  const passStrength = await zxcvbn(req.body.newPassword);
  if (passStrength.guesses < 37) {
    log.Error(
      ` *** WARNING *** - User With Email: ${req.body.email} Password Strength is: ${passStrength.guesses} and ${passStrength.crack_times_display.online_no_throttling_10_per_second} crack time estimations`
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
  await authService
    .recaptchaV3(req.body["g-recaptcha-response"])
    .then((resultRecaptchV3) => {
      if (!resultRecaptchV3) {
        log.Error(
          `Can not verify recaptcha ${appConfig.recaptchaSiteKey} error: ${resultRecaptchV3}`
        );
        return res
          .status(HttpStatusCode.InternalServerError)
          .send(
            new utils.ErrorHandler(
              "internal/recaptcha",
              "Error happened in verifying captcha!"
            ).json()
          );
      }

      if (!resultRecaptchV3.success) {
        log.Error("Error happened in validating recaptcha!");
        return res
          .status(HttpStatusCode.InternalServerError)
          .send(
            new utils.ErrorHandler(
              "internal/recaptchaNotValid",
              "Recaptcha is not valid!"
            ).json()
          );
      }
    })
    .catch((err) => {
      log.Error(`Error while recaptcha : ${err}`);
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "internal/recaptchaNotValid",
            "Error happened in validating recaptcha!"
          ).json()
        );
    });

  // Check user exist
  await authService
    .findByUsername(req.body.email)
    .then((userAuth) => {
      if (userAuth) {
        log.Error("userAlreadyExist", "User already exist - " + req.body.email);
        return res
          .status(HttpStatusCode.Conflict)
          .send(
            new utils.ErrorHandler(
              "userAlreadyExist",
              "User already exist - " + req.body.email
            ).json()
          );
      }
    })
    .catch((findError) => {
      const errorMessage = `Error while finding user by user name : ${findError}`;
      log.Error(errorMessage);
      return res
        .status(HttpStatusCode.Conflict)
        .send(
          new utils.ErrorHandler("auth.userAlreadyExist", errorMessage).json()
        );
    });

  // Create signup token
  const newUserId = uuidv4();

  //TODO: PhoneVerify
  // const token = "";
  // var tokenErr = Error();
  // if (req.body.VerifyType == "Email") {
  // } else if (req.body.VerifyType == "Phone") {
  // }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const salt = await bcrypt.genSalt(Number(appConfig.SALT));
  const hashPassword = await bcrypt.hash(req.body.newPassword, salt);

  let userData = await authService.createUser(
    newUserId,
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
  postData.id = userData.objectId;
  postData.fullName = req.body.fullName;
  postData.email = userData.username;
  postData.password = hashPassword;
  postData.userName = userData.username;
  //TODO: req.url replace with a dynamic url and add "user-agent": "authToprofile" arg
  await authService
    .callAPIWithHMAC("POST", req.url, postData, userData)
    .then(() => {
      let link = "";
      authService
        .CreateEmailVerficationToken({
          UserId: newUserId,
          Username: req.body.email,
          EmailTo: req.body.email,
          RemoteIpAddress: ip,
          // HtmlTmplPath: "views/email_code_verify.html",
          // EmailSubject: "Your verification code",
          // FullName: req.body.fullName,
          // UserPassword: hashPassword,
        })
        .then((verifyToken) => {
          link = `${verifyToken.code}`;
          const verification_Address = `${appConfig.baseURL}${appConfig.verification_Address}`;
          // TODO: if Verfify By Link
          // link = `${appConfig.authServiceURL}/user/verify/${verifyToken.code}`;

          // Send Email
          sendEmail(
            req.body.fullName,
            req.body.email,
            link,
            "email_code_verify-css",
            "Your verification code ",
            verification_Address
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
        })
        .catch((err) => {
          log.Error(`Error While Create Token: ${err}`);
          return res
            .status(HttpStatusCode.InternalServerError)
            .send(
              new utils.ErrorHandler(
                "internal/createTokenAuth",
                "Error happened in creating Token! - " + req.body.email
              ).json()
            );
        });

      var viewData = {
        Message: "An Email sent to your account please verify.",
      };
      res.render("message", viewData);
    })
    .catch((err) => {
      log.Error(err);
      log.Error("Error happened in callAPIWithHMAC!");
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "auth/callAPIWithHMAC",
            "Error happened in callAPIWithHMAC! - " + req.body.email
          ).json()
        );
    });
};

// Verify Show Signup Handle
exports.verifyGetSignupHandle = async (req, res) => {
  var viewData = {
    Title: "Verifaction - Telar Social",
    AppName: appConfig.AppName,
    OrgAvatar: appConfig.OrgAvatar,
    OrgName: appConfig.OrgName,
    ActionForm: "/auth/verify",
    SignupLink: "/auth/signup",
    Message: "You Can Signin To the Website",
  };
  res.render("code_verification", viewData);
};

// Verify Send Signup Handle
exports.verifySignupHandle = async (req, res) => {
  const token = await authService.checkTokenExist(req.body.code);
  if (!token) {
    log.Error("verifySignupHandle: Error happened in check token exist");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.tokenverifactionmissing",
          "Token exist missing"
        ).json()
      );
  }

  const countExistToken = await authService.countExistToken(req.body.code);
  if (countExistToken.counter > 0) {
    log.Error("verifySignupHandle: Error happened in check count of use token");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.tokenverifactionmissing",
          "This token has already been used"
        ).json()
      );
  }
  const user = await authService.checkUserExistById(
    token.objectId,
    token.userId
  );
  if (!user) {
    log.Error("verifySignupHandle: Error happened in check user exist");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.userverifactionmissing",
          "User exist missing"
        ).json()
      );
  }

  await authService.updateVerifyUser(user.objectId, true);
  await authService.updateTokenCounter(user.objectId);

  var viewData = {
    Message: "account verified successfully",
  };
  res.render("message", viewData);
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

  const token = await authService.checkTokenExistByUserId(
    user.objectId,
    req.params.token
  );
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

  await authService.updateVerifyUser(user.objectId, true);
  await authService.findByIdAndRemoveToken(token.objectId);

  var viewData = {
    Message: "email verified sucessfully",
  };
  res.render("message", viewData);
};
// LoginPageHandler creates a handler for logging in
exports.loginPageHandler = async (req, res) => {
  let gitClientID = appConfig.clientID
    ? "https://github.com/login/oauth/authorize?client_id=" +
      appConfig.clientID +
      "scope=user%20repo_deployment%20read:user"
    : "";

  var viewData = {
    AppName: appConfig.AppName,
    OrgName: appConfig.OrgName,
    ActionForm: "/auth/",
    Message: "You Can Signin To the Website",
    ResetPassLink: "/auth/forget_password",
    SignupLink: "/auth/signup",
    GithubLink: gitClientID,
    GoogleLink: "/auth/google",
    Title: "Login - Telar Social",
    OrgAvatar: appConfig.OrgAvatar,
  };
  res.render("login", viewData);
};

// POST login
exports.loginHandler = async (req, res) => {
  const { error } = logInBodyValidation(req.body);
  if (error) {
    log.Error("loginHandler: missing validation");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "auth.loginmissingvalidation",
          "Missing validation"
        ).json()
      );
  }
  const foundUser = await authService
    .findByUsername(req.body.username)
    .catch((err) => {
      log.Error(`loginHandler: User not found ${err}`);
    });
  if (!foundUser) {
    log.Error("loginHandler: Invalid email or password");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.loginInvalid",
          "Invalid email or password"
        ).json()
      );
  }

  if (!foundUser.emailVerified && !foundUser.phoneVerified) {
    log.Error("loginHandler: Unverified email");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.loginunverifiedemail",
          "Unverified email"
        ).json()
      );
  }

  const CompareHash = await authService.CompareHash(
    req.body.password,
    foundUser.password
  );

  if (!CompareHash) {
    log.Error(`loginHandler: Password doesn't match ${CompareHash}`);
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "auth.passwordNotMatch",
          "Password doesn't match!"
        ).json()
      );
  }

  const profile = authService.getUserProfileByID(foundUser.objectId);

  if (!profile) {
    log.Error(`loginHandler: Profile doesn't exist ${profile}`);
  }
  // If you request a user login with a user role,
  // use the refresh Token to log in, and other roles must use accessToken
  res.cookie("token", await generateTokens.accessToken(foundUser));
  //TODO: Change Model
  //refreshToken Save To DB With access_token Name
  const refreshToken = await generateTokens.refreshToken(foundUser);
  res.cookie("refreshToken", refreshToken);
  //TODO: use headers authorization
  // const tokenauthorization = req.headers.authorization.split(" ");
  res.status(200).json({
    error: false,
    refreshToken,
    message: "Logged in sucessfully",
  });
};

// CheckAdmin find user auth by userId
exports.checkAdminHandler = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    log.Error("checkAdminHandler: Token Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler("auth.missingcheckadmin", "Missing Token").json()
      );
  }
  const findUser = authService.findUserByAccessToken(token);
  if (!findUser) {
    log.Error("checkAdminHandler: Not Found User With Exist Token");
    return res
      .status(HttpStatusCode.NotFound)
      .send(
        new utils.ErrorHandler(
          "auth.missingcheckadmin",
          "Not Found User With Exist Token"
        ).json()
      );
  }
  if (findUser.role == "admin") return findUser;
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  var viewData = {
    Message: "User LogOut successfully.",
  };
  res.render("message", viewData);
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

  var viewData = {
    AppName: appConfig.AppName,
    ActionForm: "/auth/password/reset",
    LoginLink: "/auth/login",
    OrgName: appConfig.OrgName,
    Title: "Reset User Password",
    OrgAvatar: appConfig.OrgAvatar,
  };
  res.render("reset_password", viewData);
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

        var viewData = {
          Message: "change password sucessfully.",
        };
        res.render("message", viewData);
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
    log.Error("ResetPassHandle: An Error Occurred");
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "missingResetPassword",
          "Missing Reset Password"
        ).json()
      );
  }
};

// Forget password Page
exports.getForgetPasswordPage = async (req, res) => {
  var viewData = {
    AppName: appConfig.AppName,
    LoginLink: "/auth/login",
    OrgName: appConfig.AppName,
    Title: "Forget Password",
    OrgAvatar: appConfig.OrgAvatar,
    ActionForm: "/auth/password/forget",
  };
  res.render("forget_password", viewData);
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

  //TODO: why check exist(In Go) - NOW IS FIXED
  const user = await authService.findByUsername(req.body.email);
  if (!user) {
    log.Error(`ForgetPassHandle : User not exist by email : ${user}`);
    return res
      .status(HttpStatusCode.Conflict)
      .send(
        new utils.ErrorHandler(
          "forgetNotExist",
          "User not exist - " + req.body.email
        ).json()
      );
  }
  // let token = await authService.getTokenByUserId(user.objectId);
  // if (!token)
  const token = await authService.createToken(user.objectId);
  // const link = `${appConfig.authServiceURL}/forget_password/${user.objectId}/${token.code}`;
  const link = `${appConfig.authServiceURL}/password/forget/${user.objectId}/${token.code}`;

  let sendMail = false;
  sendMail = await sendEmail(
    user.username,
    user.username,
    link,
    "email_link_verify_reset_pass-css",
    "Request to change your password",
    "" //additionalField
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
  var viewData = {
    Message: "password reset link sent to your email account",
  };
  res.render("message", viewData);
};

// Forget password
exports.getForgetPassword = async (req, res) => {
  const reqUserId = req.params.userId;
  const reqToken = req.params.token;
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

  const token = await authService.checkTokenExistByUserId(
    user.objectId,
    req.params.token
  );

  if (!token) {
    log.Error("ForgetPassHandle: user Token Problem");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.missingforgettoken",
          "Missing Token forget password"
        ).json()
      );
  }
  await authService.addCounterAndLastUpdate(token.objectId);
  const access = await generateTokens.accessToken(user);
  await generateTokens.refreshToken(user);
  res.cookie("token", access);
  var viewData = {
    AppName: appConfig.AppName,
    ActionForm: "/auth/password/change",
    LoginLink: "/auth/login",
    OrgName: appConfig.OrgName,
    Title: "Forget Password",
    OrgAvatar: appConfig.OrgAvatar,
  };
  res.render("reset_password", viewData);
};
// ChangePasswordHandler creates a handler for logging in
exports.changePasswordHandler = async (req, res) => {
  try {
    //TODO: Not Empty token!!! and res.clear >> not exist token!!
    const token = req.cookies.token;
    if (!token) {
      log.Error("changePassHandle: Authentication Problem");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "auth.changePassHandle",
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

        var viewData = {
          Message: "change password sucessfully.",
        };
        res.render("message", viewData);
      })
      .catch(() => {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        log.Error("changePassHandle: Find User Problem");
        return res
          .status(HttpStatusCode.Unauthorized)
          .send(
            new utils.ErrorHandler(
              "missingChangePassHandle",
              "Missing Change Password"
            ).json()
          );
      });
  } catch (error) {
    log.Error(`changePassHandle: An Error Occurred ${error}`);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "missingChangePassHandle",
          "Missing Change Password"
        ).json()
      );
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
      var viewData = { userData: response.data };
      res.render("success", viewData);
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

// Show all UsersAuth
exports.getUsers = async (req, res) => {
  await authService
    .getUsers()
    .then((users) => res.send(users))
    .catch(() => {
      log.Error("ForgetPassHandle: find user Problem");
      return res
        .status(HttpStatusCode.NotFound)
        .send(
          new utils.ErrorHandler(
            "missinggetAllUser",
            "Missing get all user data"
          ).json()
        );
    });
};
// Show all Tokens
exports.getTokens = async (req, res) => {
  await authService
    .getTokens()
    .then((tokens) => res.send(tokens))
    .catch(() => {
      log.Error("ForgetPassHandle: find user Problem");
      return res
        .status(HttpStatusCode.NotFound)
        .send(
          new utils.ErrorHandler(
            "missinggetAllTokens",
            "Missing Found Token"
          ).json()
        );
    });
};

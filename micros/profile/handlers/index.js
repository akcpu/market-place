const { ajv } = require("../validation");
const validate_getID = ajv.getSchema("getID");
const validate_setData = ajv.getSchema("setData");
const hmac = require("../utils/hmac");
const { appConfig } = require("../config");
const log = require("../utils/errorLogger");
const utils = require("../utils/error-handler");
const { HttpStatusCode } = require("../utils/HttpStatusCode");
const profileService = require("../services/profile-service");

// GET /UserProfile
exports.getProfileData = async function (req, res) {
  const profile = await profileService.getProfileData(req.params.id);
  if (!profile) {
    log.Error("getProfileDataHandle: Error happened in get data from profile!");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.getprifiledatamissing",
          "get profile data missing"
        ).json()
      );
  }
  return profile;
};

// GET Profile
exports.getProfile = async function (req, res) {
  const token = req.cookies.token;
  if (!token) {
    log.Error("GetProfileHandle: Get Profile Problem");
    return res
      .status(HttpStatusCode.Unauthorized)
      .send(
        new utils.ErrorHandler(
          "profile.missingGetProfile",
          "Missing Get Profile"
        ).json()
      );
  }
  const findProfile = await profileService
    .findProfileByAccessToken(token)
    .then((profile) => res.send(profile))
    .catch(() => res.status(404).json({ msg: "No profile found" }));
  if (!findProfile) {
    log.Error("ResetPassHandle: Find Profile Problem");
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "auth.missingloginFind",
          "Missing Find Profile"
        ).json()
      );
  }
  res.send(findProfile);
};

// GET All Profiles
exports.getProfiles = function (req, res) {
  profileService
    .getProfiles()
    .then((profiles) => res.send(profiles))
    .catch(() => res.status(404).json({ msg: "No profile found" }));
};

// GET /Profile/:id
exports.getProfileById = function (req, res) {
  if (validate_getID(req.params)) {
    profileService
      .getProfileById(req.params.id)
      .then((profiles) => {
        res.send(profiles);
      })
      .catch(() => res.status(404).json({ msg: "No profile found" }));
  } else {
    console.log(validate_getID.errors);
    res
      .status(404)
      .json({ msg: "No user found" + JSON.stringify(validate_getID.errors) });
  }
};

// POST /profiles
exports.setprofile = function (req, res) {
  console.log(`.:PROFILE INORMATION:. ${JSON.stringify(req.body)}`);
  let hash = req.header(appConfig.HMAC_HEADER_NAME);
  hmac
    .validate(JSON.stringify(req.body), appConfig.HMAC_SECRET_KEY, hash)
    .then(() => {
      if (validate_setData(req.body)) {
        profileService.setprofile(req.body);
        res.send("User has been added to Profile microservice service");
      } else {
        console.log(validate_setData.errors);
        res.status(404).json({
          msg: "No user found" + JSON.stringify(validate_setData.errors),
        });
      }
    })
    .catch((err) => {
      return res.send(`Error while Save User:  ${err}`);
    });
};

const express = require("express");
const profileRouter = express.Router();

const {
  setprofile,
  getProfileData,
  getProfiles,
  getProfileById,
  getProfile,
} = require("../handlers");

profileRouter.get("/profile/dto/id/:id", getProfileData);
profileRouter.get("/profile", getProfile);
profileRouter.get("/allprofile", getProfiles);
profileRouter.get("/profile/:id", getProfileById);
profileRouter.post("/profile/dto", setprofile);

module.exports = profileRouter;

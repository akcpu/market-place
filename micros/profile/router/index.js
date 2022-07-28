const express = require("express");
const profileRouter = express.Router();

const {
  setProfile,
  getProfileData,
  getProfiles,
  getProfileById,
  getProfile,
} = require("../handlers");

profileRouter.get("/profile/dto/id/:id", getProfileData);
profileRouter.get("/profile", getProfile);
profileRouter.get("/profie/all", getProfiles);
profileRouter.get("/profile/:id", getProfileById);
profileRouter.post("/profile/dto", setProfile);

module.exports = profileRouter;

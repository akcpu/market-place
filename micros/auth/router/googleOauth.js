const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log(req);
    var viewdata = { user: req.user._json };
    res.render("google", viewdata);
    // res.redirect("/auth/googlesuccess");
  }
);
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;

const { ajv } = require("../validation");
const validate_getID = ajv.getSchema("getID");
const validate_setData = ajv.getSchema("setData");
const hmac = require("../utils/hmac");
const { appConfig } = require("../config");

const userService = require("../services/user-service");
// GET /users
exports.getUsers = function (req, res) {
  userService
    .getUsers()
    .then((users) => res.send(users))
    .catch(() => res.status(404).json({ msg: "No user found" }));
};

// GET /users/:id
exports.getUserById = function (req, res) {
  if (validate_getID(req.params)) {
    userService
      .getUserById(req.params.id)
      .then((users) => {
        res.send(users);
      })
      .catch(() => res.status(404).json({ msg: "No user found" }));
  } else {
    console.log(validate_getID.errors);
    res
      .status(404)
      .json({ msg: "No user found" + JSON.stringify(validate_getID.errors) });
  }
};

// POST /users
exports.setUser = function (req, res) {
  let hash = req.header("X-Cloud-Signature");
  hmac
    .validate(JSON.stringify(req.body), appConfig.HMAC_SECRET_KEY, hash)
    .then(() => {
      if (validate_setData(req.body)) {
        userService.setUser(req.body);
        res.send("User has been added successfully");
      } else {
        console.log(validate_setData.errors);
        res.status(404).json({
          msg: "No user found" + JSON.stringify(validate_setData.errors),
        });
      }
    })
    .catch((err) => {
      return res.send("error: " + err);
    });
};

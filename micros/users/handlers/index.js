const { ajv } = require("../validation");
const validate_getID = ajv.getSchema("getID");
const validate_setData = ajv.getSchema("setData");

const userService = require("../services/user-service");
// GET /users
exports.getUsers = function (_req, res) {
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
  if (validate_setData(req.body)) {
    try {
      const newUser = {
        id: req.body.id,
        fullName: req.body.fullName,
        userName: req.body.userName,
        password: req.body.password,
        email: req.body.email,
      };

      let setUserResult = userService.setUser(newUser);
      res.send("User has been added successfully" + setUserResult.userName);
    } catch (error) {
      return res.send("error: " + error);
    }
  } else {
    console.log(validate_setData.errors);
    res
      .status(404)
      .json({ msg: "No user found" + JSON.stringify(validate_setData.errors) });
  }
};

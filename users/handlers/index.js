const userService = require("../services/user-service");

// GET /users
exports.getUsers = function (_req, res) {
  userService
    .getUsers()
    .then((users) => {
      res.send(users);
    })
    .catch(() => res.status(404).json({ msg: "No user found" }));
};

// GET /users/:id
exports.getUserById = function (req, res) {
  userService
    .getUserById(req.params.id)
    .then((users) => {
      res.send(users);
    })
    .catch(() => res.status(404).json({ msg: "No user found" }));
};

// POST /users
exports.setUser = function (req, res) {
  try {
    const newUser = {
      id: req.body.id,
      fullName: req.body.fullName,
      userName: req.body.userName,
      password: req.body.password,
      email: req.body.email,
    };

    let setUserResult = userService.setUser(newUser);
    res.send("User has been added successfully" + setUserResult);
  } catch (error) {
    return res.send("error: " + error);
  }
};

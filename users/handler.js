const db = require('../db');

// GET /api/users
exports.getUsers = function (req, res) {
    return res.send(db.users);
};

// GET /api/users/:id
exports.getUserById = function (req, res) {
    var reqId = req.params.id;
    const user = db.users.filter((user) => {
        if ((reqId == user.id)) {
            return true
        }
        else {
            return false
        }
    })
    if (user) {
        return res.send(user);
    } else {
        return res.send('ID not correct.');
    }
};

// POST /api/users
exports.setUser = function (req, res) {
    var user = {
        "id": req.body.id,
        "fullName": req.body.fullName,
        "userName": req.body.userName,
        "password": req.body.password,
        "email": req.body.email
    };
    db.users.push(user);

    return res.send('User has been added successfully');
};
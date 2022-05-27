const User = require('../users/database/user');
//POST /api/login
exports.login = function (req, res) {
    User.findOne({ userName: req.body.userName, password: req.body.password }, function (err, user) {
        if ((req.body.userName == user.userName) && (user.password == req.body.password)) {
                return res.send(user);
            }
            else {
                return res.send('Username or password not correct.');
            }
        });

};

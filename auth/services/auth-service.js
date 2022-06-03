const User = require('../models/user');

exports.login = function (userName, password) {
     return User.findOne({ userName: userName, password: password })
}

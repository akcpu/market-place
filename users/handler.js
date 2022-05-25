//const db = require('../db');
const User = require('../models/user');
// GET /api/users
exports.getUsers = function (req, res) {
    User.find()
    .then(users => res.send(users))
    .catch(err => res.status(404).json({ msg: 'No user found' }));
};

// GET /api/users/:id
exports.getUserById = function (req, res) {
    try{
        if(req.params.id){
            User.findOne({ id: req.params.id }, function (err, users) {
                return res.send(users);
            });
        }else{
            return res.send('ID not correct.');
        }
      }catch(error){
        throw error
      }
};

// POST /api/users
exports.setUser = function (req, res) {
    const newUser = new User({
        "id": req.body.id,
        "fullName": req.body.fullName,
        "userName": req.body.userName,
        "password": req.body.password,
        "email": req.body.email
      })

      newUser.save().then(users => res.send(users));
    return res.send('User has been added successfully');
};
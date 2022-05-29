const userService = require('./services/user-service')
// GET /api/users
exports.getUsers = function (req, res) {
    userService.getUsers()
        .then((users) => { res.send(users) })
        .catch(err => res.status(404).json({ msg: 'No user found' }));
};

// GET /api/users/:id
exports.getUserById = function (req, res) {
    try {
        if (req.params.id) {
            userService.getUserById(req.params.id)
                .then((users) => { res.send(users) })
                .catch(err => res.status(404).json({ msg: 'No user found' + err}));
            // return res.send(userService.getUserById(req.params.id));
        } else {
            return res.send('ID not correct.');
        }
    } catch (error) {
        throw error
    }
};

// POST /api/users
exports.setUser = function (req, res) {
    try {
        const newUser = {
            id: req.body.id,
            fullName: req.body.fullName,
            userName: req.body.userName,
            password: req.body.password,
            email: req.body.email
        };

        userService.setUser(newUser)
        res.send('User has been added successfully');
    } catch (error) {
        return res.send('error: ' + error);
    }
};
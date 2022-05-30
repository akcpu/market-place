const authService = require('./services/auth-service')
//POST /api/login
exports.login = function (req, res) {
    try {
        if (req.body.userName) {
            authService.login(req.body.userName, req.body.password)
                .then((users) => { res.send(users) })
                .catch(err => res.status(404).json({ msg: 'No user found' + err }));
        } else {
            return res.send('ID not correct.');
        }
    } catch (error) {
        throw error
    }
};
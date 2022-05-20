app.post('/api/login', function (req, res) {
    var userName = req.body.userName;
    var password = req.body.password;
    const user = db.users.filter((user) =>{
        if ((userName == user.userName) && (user.password == password)) {
            return true
        }
        else {
            return false
        }
    })
    if (user){
        return res.send(user);
    } else {
        return res.send ('Username or password not correct.');
    }
});
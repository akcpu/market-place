'use strict';
const express = require('express');
const db = require('./db.js');
//constants
const PORT = 8080;
const HOST = '0.0.0.0';

//App
const app = express();

// for parsing the body in POST request
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET /
app.get('/', function (req, res) {
    return res.send('Hello World..');
});

// GET /api/users
app.get('/api/users', function (req, res) {
    return res.send(db.users);
});

// GET /api/users/:id
app.get('/api/users/:id', function (req, res) {
    return res.send('get a user by user id ' + req.params.id);
});

app.post('/api/users', function (req, res) {
    var user = {
        "id": req.body.id,
        "fullName": req.body.fullName,
        "userName": req.body.userName,
        "password": req.body.password,
        "email": req.body.email
    };
    db.users.push(user);

    return res.send('User has been added successfully');
});

// GET /api/products
app.get('/api/products', function (req, res) {
    res.send(db.products);
});

// GET /api/products/:id
app.get('/api/products/:id', function (req, res) {
    return res.send('get a product by product id' + req.params.id);
});

app.post('/api/products', function (req, res) {
    var product = {
        id: req.body.id,
        "name": req.body.name,
        price: req.body.price,
        "desc": req.body.desc
    };
    db.products.push(product);

    return res.send('product has been added successfully');
});

app.post('/api/login', function (req, res) {
    var userName = req.body.userName;
    var password = req.body.password;
    var valid;
    var index;
    for (var i = 0; i < db.users.length; i++) {
        if ((userName == db.users[i].userName) && (password == db.users[i].password)) {
            //if (db.users.filter((userName) => db.users.userName === userName && db.users.password === password)) {
            valid = true;
            index = i;
            return res.send('User has been login successfully  -  Index: ' + index);
            break;
        }
        else {
            return res.send('Username or password not correct.');
        }
    }
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
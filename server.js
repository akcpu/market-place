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
    var reqId = req.params.id;
    const user = db.users.filter((user) =>{
        if ((reqId == user.id) ) {
            return true
        }
        else {
            return false
        }
    })
    if (user){
        return res.send(user);
    } else {
        return res.send ('ID not correct.');
    }
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
    var reqId = req.params.id;
    const product = db.products.filter((product) =>{
        if ((reqId == product.id) ) {
            return true
        }
        else {
            return false
        }
    })
    if (product){
        return res.send(product);
    } else {
        return res.send ('ID not correct.');
    }
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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
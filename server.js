'use strict';
const express = require('express');

//constants
const PORT = 8080;
const HOST = '0.0.0.0';

//App
const app = express();

// for parsing the body in POST request
var bodyParser = require('body-parser');

var users =[{
    id: 10,
    name: "John Doe",
    pass : "23",
    email: "john@doe.com"
}];

var products =[{
    id: 1,
    name: "John Doe",
    price : 23,
    "desc": "product desc"
}];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET /
app.get('/', function (req, res) {
    return res.send('Hello World..');
});

// GET /api/users
app.get('/api/users', function(req, res){
    return res.send(users);
});

// GET /api/users/:id
app.get('/api/users/:id', function(req, res){
    return res.send('get a user by user id '+ req.params.id);   
});

/* POST /api/users
    {
        "user": {
            id: 3,
            "name": "Test User",
            "pass" : "20",
            "email": "test@test.com"
        }
    }
*/
app.post('/api/users', function (req, res) {
    var user ={
        id: req.body.id,
        "name": req.body.name,
        "pass" : req.body.pass,
        "email": req.body.email
    };
    users.push(user);

    return res.send('User has been added successfully');
});

// GET /api/products
app.get('/api/products', function(req, res){
    res.send(products);
});

// GET /api/products/:id
app.get('/api/products/:id', function(req, res){
    return res.send('get a product by product id' + req.params.id);   
});

/* POST /api/products
    {
        "product": {
           "id": 3,
            "name": "Test User",
            "price" : 20,
            "desc": "product desc"
        }
    }
*/
app.post('/api/products', function (req, res) {
    var product ={
        id: req.body.id,
        "name": req.body.name,
        price : req.body.age,
        "desc": req.body.email
    };
    products.push(product);

    return res.send('product has been added successfully');
});


app.post('/api/login', function (req, res) {
    var userName = req.body.name;
    var pass = req.body.pass;
    var valid;
    var index;
        for (var i=0; i <users.length; i++) {
            if ((userName == users[i].user) && (pass == users[i].pass)) {
                valid = true;
                index = i;
                break;
            }
        }
    
    return res.send('User has been login successfully' + valid + index);
});


app.listen(PORT,HOST);
console.log(`Running on http://${HOST}:${PORT}`);
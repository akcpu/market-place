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
    id: 1,
    name: "John Doe",
    age : 23,
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
app.post('/', function (req, res) {
    return res.send('Hello World');
});

// GET /api/users
app.get('/api/users', function(req, res){
    res.send(users);
});

// GET /api/users/:id
app.get('/api/users/:id', function(req, res){
    return res.send('get a user by user id');   
});

/* POST /api/users
    {
        "user": {
           "id": 3,
            "name": "Test User",
            "age" : 20,
            "email": "test@test.com"
        }
    }
*/
app.post('/api/users', function (req, res) {
    var user = req.body.user;
    users.push(user);

    return res.send('User has been added successfully');
});

// GET /api/products
app.get('/api/products', function(req, res){
    return res.send('collection of registered products');
    
});

// GET /api/products/:id
app.get('/api/products/:id', function(req, res){
    return res.send('get a product by product id');   
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
    var product = req.body.product;
    product.push(product);

    return res.send('product has been added successfully');
});

app.listen(PORT,HOST);
console.log('Running on http://${HOST}:${PORT}');
'use strict';
const express = require('express');
//const db = require('db.js');
let db = {}
db.users = [{
    "id":1,
    "userName": "user",
    "name": "user",
    "pass": "123123",
},
{
    "id":2,
    "userName": "user2",
    "name": "user2",
    "pass": "111111",
},]

db.products = [{
    "id":100,
    "productName": "product1",
    "productDescription": "product Description1",
    "productPrice": 123123,
},
{
    "id":102,
    "productName": "product2",
    "productDescription": "product Description2",
    "productPrice": 123123,
},]


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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET /api/users
app.get('/api/users', function(req, res){
    return res.json(users);    
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

app.listen(PORT,HOST);
console.log('Running on http://${HOST}:${PORT}');
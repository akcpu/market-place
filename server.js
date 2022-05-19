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


app.get('/', (req, res) => {
    res.send('Hello World.!',req,res);
    console.log(db);

});

app.get('/users', (req, res) => {
        res.send(db.users.id[index]+" " + db.users.userName[index]+" " + db.users.name[index]+" " + db.users.pass[index]);
});

app.get('/users/:id', (req, res) => {
    res.send('get a user by user id');
});
app.post('/users', (req, res) => {
    db.users.push({userName: 'armank',pass:'paas', name: 'arman',id:3})
    res.send('register a user');
    console.log(db);

});

app.get('/products', (req, res) => {
    res.send('collection of registered products');
});
app.get('/products/:id', (req, res) => {
    res.send('get a product by product id');
});
app.post('/products', (req, res) => {
    db.products.push({productName: 'product3',productPrice:3214, productDescription: 'productDecription3',id:3})
    res.send('register a product');
});

app.post('/login', (req, res) => {
    res.send('authenticate the user');
});

app.listen(PORT,HOST);
console.log('Running on http://${HOST}:${PORT}');
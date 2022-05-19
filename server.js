'use strict';
const express = require('express');

//constants
const PORT = 8080;
const HOST = '0.0.0.0';

//App
const app = express();
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/users', (req, res) => {
    res.send(' a collection of registered usres');
});
app.get('/users/:id', (req, res) => {
    res.send('get a user by user id');
});
app.post('/users', (req, res) => {
    res.send('register a user');
});
app.get('/products', (req, res) => {
    res.send('collection of registered products');
});
app.get('/products/:id', (req, res) => {
    res.send('get a product by product id');
});
app.post('/products', (req, res) => {
    res.send('register a product');
});
app.post('/login', (req, res) => {
    res.send('authenticate the user');
});
app.listen(PORT,HOST);
console.log('Running on http://${HOST}:${PORT}');


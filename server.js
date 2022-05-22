'use strict';
const express = require('express');
//const db = require('./db.js');
var mongoose = require('mongoose');

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://mongo:27017/docker-node-mongo',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
     
const { login } = require('./auth/handler');
const { getUsers, getUserById, setUser } = require('./users/handler');
const { getproducts, getProductById, setProduct } = require('./products/handler');

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

app.post('/api/login', login);

app.get('/api/users', getUsers);
app.get('/api/users/:id', getUserById);
app.post('/api/users', setUser);

app.get('/api/products', getproducts);
app.get('/api/products/:id', getProductById);
app.post('/api/products', setProduct);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

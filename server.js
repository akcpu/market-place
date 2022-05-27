'use strict';
const express = require('express');
var mongoose = require('mongoose');

//constants
const PORT = 8080;
const HOST = '0.0.0.0';

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://127.0.0.1:27017/market-place'
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

//App
const app = express();
// for parsing the body in POST request
var bodyParser = require('body-parser');

// GET /
app.get('/', function (req, res) {
  return res.send('Hello World..');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authRouter = require('./auth/router/index')
app.use(authRouter)

const userRouter = require('./users/router/index')
app.use(userRouter)

const productRrouter = require('./products/router/index')
app.use(productRrouter)

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
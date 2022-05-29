'use strict';
const express = require('express');
const mongoose = require('mongoose');
const app = express();
var bodyParser = require('body-parser');
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userConnect = require('./users/database/index');
const productConnect = require('./products/database/index');
 
app.get('/', function (req, res) {
  return res.send('Hello World..');
});

const authRouter = require('./auth/router/index')
app.use(authRouter)

const userRouter = require('./users/router/index')
app.use(userRouter)

const productRrouter = require('./products/router/index')
app.use(productRrouter)

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
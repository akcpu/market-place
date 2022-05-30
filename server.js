'use strict';
const express = require('express');
const mongoose = require('mongoose');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userDB = require('./users/database/index');
const productDB = require('./products/database/index');
userDB.connect();
productDB.connect();

app.get('/', function (req, res) { return res.send('Hello World..'); });
const authRouter = require('./auth/router/index')
const userRouter = require('./users/router/index')
const productRrouter = require('./products/router/index')

app.use(authRouter, userRouter, productRrouter)

const PORT = 8080;
const HOST = '0.0.0.0';
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
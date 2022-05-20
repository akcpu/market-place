'use strict';
const express = require('express');
const db = require('./db.js');
let module = await import ('./auth/handler.js');

// var fs = require('./auth/handler');
// var fs2 = require('./users/handler');
// var fs3 = require('./products/handler');

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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
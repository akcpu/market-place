const express = require('express')
const authRouter = express.Router()

const { login } = require('../handler');

authRouter.post('/api/login', login);

module.exports = authRouter
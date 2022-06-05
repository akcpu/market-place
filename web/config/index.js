require('dotenv').config();

const DB_URI =process.env.mongo_host

module.exports = {
  DB_URI,
};
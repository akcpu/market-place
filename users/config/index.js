 require('dotenv').config();

exports.appConfig = {
  host: process.env.mongo_host,
}
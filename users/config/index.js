require('dotenv').config();

// exports.appConfig = {
//   host: "mongodb://mongo:27017/market-place-user"
//   //host: process.env.mongo_host,
// }
const DB_URI =
  process.env.MONGO_DB_URI ?? 'mongodb://localhost:27017/market-place';

module.exports = {
  DB_URI,
};
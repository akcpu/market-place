require("dotenv").config();

const DB_URI =
  process.env.MONGO_DB_URI ?? "mongodb://localhost:27017/market-place";

module.exports = {
  DB_URI,
};

// require('dotenv').config();

// exports.appConfig = {
//     mongoHost: process.env.mongo_host,
//     mongoDBName: process.env.mongo_database,
// }

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://mongo:27017/market-place'
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
// const { appConfig } = require('../config/index')

// const mongoose = require('mongoose');

// // Connect to the database.
// exports.connect = (listen) => {
//     mongoose.Connection
//         .on('error', console.log)
//         .on('disconnected', () => {console.log('disconnected')})
//         .once('open', listen)
//         const host = Buffer.from(appConfig.mongoHost, 'base64').toString()
//         console.log('[INFO] mongohost: ', host);
//     return mongoose.connect(host, {
//         keepAlive: 1,
//         userNewParser: true,
//         userUnifiedTopology: true
//     });
    
// }
const { appConfig } = require('../config/index')

mongoose.connect(appConfig.mongo_host)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
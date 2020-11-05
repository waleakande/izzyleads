const mongoose = require('mongoose');

const {
  accessibleRecordsPlugin,
  accessibleFieldsPlugin,
} = require('@casl/mongoose');

mongoose.plugin(accessibleRecordsPlugin);
mongoose.plugin(accessibleFieldsPlugin);
const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
import dotenv from 'dotenv';
const envFound = dotenv.config();

if (envFound.error && !process.env.HEROKU_SERVER) {
  // This error should crash whole process
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

import express from 'express';

import Logger from './loaders/logger';
import loaders from './loaders';

import config from 'config';
// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('NODE_CONFIG_ENV: ' + config.util.getEnv('NODE_ENV'));

async function startServer() {
  const app = express();

  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   *
   * */
  await loaders({ expressApp: app });

  const PORT = process.env.PORT || config.get('port');

  process.on('UnhandledPromiseRejectionWarning:', () => {
    console.log(app);
  });

  app.listen(PORT, err => {
    if (err) {
      Logger.error(err);
      process.exit(1);
      return;
    }
    Logger.info(`
      ################################################
      🛡️  Server listening on port: ${PORT} 🛡️ 
      ################################################
    `);
  });
}

startServer();

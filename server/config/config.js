"use strict";

const env = process.env.NODE_ENV || 'development';
if (env === 'development' || env === 'test') {
  const jsonConfig = require('./config.json');
  const envConfig = jsonConfig[env];
  Object.keys(envConfig).forEach(key => process.env[key] = envConfig[key]);
}

module.exports = {
  authHeader: 'x-auth',
  access: 'auth',
  secret: process.env.JWT_SECRET,
  port: process.env.PORT,
  mongoUrl: process.env.MONGODB_URI
}
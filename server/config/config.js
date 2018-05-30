"use strict";

module.exports = {
  port: process.env.PORT || 3000, // Heroku or localhost
  authHeader: 'x-auth',
  access: 'auth',
  secret: 'S3KR3T',
  mongoUrl: process.env.MONGODB_URI || // Heroku env
           `mongodb://localhost:27017/${(process.env.NODE_ENV === 'test') ? 'TodoAppTest' : 'TodoApp'}`
}                                      // Test env @ localhost                           // dev env

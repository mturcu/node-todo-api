"use strict";

const
  mongoose = require('mongoose'),

    config = require('../config/config'); 

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl)
.then(m => console.log('Connected to database', m.connections[0].name))
.catch(e => console.log(e.message));

module.exports = {mongoose};
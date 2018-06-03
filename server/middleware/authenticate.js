"use strict";

const
  {User} = require('../models/user'),
  {authHeader} = require('../config/config');

var authenticate = (req, res, next) => {
  let token = req.header(authHeader);
  User.findByToken(token)
  .then(user => {
    if (!user) {
      return Promise.reject({message: `User or token not found`});
    }
    req.user = user;
    req.token = token;
    next();
  })
  .catch(e => {
    res.status(401).send({error: `Authentication failure: ${e.message}`});
  });
}

module.exports = {authenticate};
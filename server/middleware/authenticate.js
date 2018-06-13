"use strict";

const {User} = require('../models/user');
const {authHeader} = require('../config/config');

const authenticate = async (req, res, next) => {
  const token = req.header(authHeader);
  try {
    let user = await User.findByToken(token);
    if (!user) throw new Error('User or token not found');
    req.user = user;
    req.token = token;
    next();
  } catch(e) {
    res.status(401).send({error: `Authentication failure: ${e.message}`});
  }
}

module.exports = {authenticate};
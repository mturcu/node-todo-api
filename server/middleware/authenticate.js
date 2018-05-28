const
  {User} = require('../models/user'),
  config = require('../config/config');


var authenticate = (req, res, next) => {
  let token = req.header(config.authHeader);
  User.findByToken(token)
  .then(user => {
    if (!user) {
      return Promise.reject({message: `User not found`});
    }
    req.user = user;
    req.token = token;
    next();
  })
  .catch(e => {
    res.status(401).send({error: `Authentication failure: ${e.message}`});
  });
}

module.exports = { authenticate };
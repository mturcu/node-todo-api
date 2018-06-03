"use strict";

const
   mongoose = require('mongoose'),
  validator = require('validator'),
        jwt = require('jsonwebtoken'),
     bcrypt = require('bcryptjs'),
          _ = require('lodash'),

{access, secret} = require('../config/config');

var UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid e-mail address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true,
    unique: false
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  return _.pick(this.toObject(), ['_id','email']);
}

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let token = jwt.sign({_id: user._id.toHexString(), access}, secret).toString();
  user.tokens = user.tokens.concat({access, token});
  return user.save()
  .then(() => token)
  .catch(e => {
    console.log('generateAuthToken user.save() error:', e.message);
  });
}

UserSchema.methods.removeToken = function(token) {
  let user = this;
  return user.update({
    $pull: { tokens: {token} }
  })
  .then(() => console.log('Removed token from user', user.email))
  .catch(e => console.log('removeToken user.update() error:', e.message));
}

UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  }
  catch(e) {
    console.log('User.findByToken error:', e.message);
    return Promise.reject(e);
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': access
  });
}

UserSchema.statics.findByCredentials = function(email, password) {
  let User = this;
  return User.findOne({email})
  .then(user => {
    if (!user) return Promise.reject({message: 'User not found'});
    return bcrypt.compare(password, user.password)
    .then(pwd => {
      if (!pwd) return Promise.reject({message: 'Bad password'});
      return user;
    });
  });
}

UserSchema.pre('save', function() {
  let user = this;
  if (user.isModified('password')) {
    // console.log('Detected new password');
    return bcrypt.hash(user.password, 10)
    .then(hash => user.password = hash);
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
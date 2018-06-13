"use strict";

const mongoose = require('mongoose');
const {pick} = require('lodash');
const {isEmail} = require('validator');
const {sign, verify} = require('jsonwebtoken');
const {hash, compare} = require('bcryptjs');

const {access, secret} = require('../config/config');

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: isEmail,
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
  return pick(this.toObject(), ['_id','email']);
}

UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = sign({_id: user._id.toHexString(), access}, secret).toString();
  user.tokens = user.tokens.concat({access, token});
  try {
    await user.save();
    return token;
  } catch(e) {
    console.log('generateAuthToken user.save() error:', e.message);
  }
}

UserSchema.methods.removeToken = async function(token) {
  const user = this;
  try {
    await user.update({$pull: {tokens: {token}}});
    console.log('Removed token = require( user', user.email);
  } catch(e) {
    console.log('removeToken user.update() error:', e.message);
  }
}

UserSchema.statics.findByToken = async function(token) {
  const User = this;
  let decoded, user;
  try {
    decoded = await verify(token, secret);
    if (!decoded) throw new Error('jwt.verify did not return a valid result');
  }
  catch(e) {
    console.log('User.findByToken error:', e.message);
    throw(e);
  }
  try {
    user = await User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': access
    });
    return user;
  } catch(e) {
    console.log('User.findOne error:', e.message);
    throw(e);
  }
}

UserSchema.statics.findByCredentials = async function(email, password) {
  const User = this;
  try {
    const user = await User.findOne({email});
    if (!user) throw new Error('User not found');
    let pwd = await compare(password, user.password);
    if (!pwd) throw new Error('Bad password');
    return user;
  } catch(e) {
    throw(e);
  }
}

UserSchema.pre('save', async function() {
  if (this.isModified('password')) this.password = await hash(this.password, 10);
});

const User = mongoose.model('User', UserSchema);

module.exports = {User};
const
   mongoose = require('mongoose'),
  validator = require('validator'),
        jwt = require('jsonwebtoken'),
     bcrypt = require('bcryptjs'),
          _ = require('lodash'),

     config = require('../config/config');

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
  let access = config.access;
  let token = jwt.sign({_id: user._id.toHexString(), access}, config.secret).toString();
  user.tokens = user.tokens.concat({access, token});
  return user.save().then(() => token);
}

UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, config.secret);
  }
  catch(e) {
    console.log('User.findByToken error:', e.message);
    return Promise.reject(e);
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': config.access
  });
}

UserSchema.pre('save', function() {
  let user = this;
  if (user.isModified('password')) {
    console.log('Detected new password');
    return bcrypt.hash(user.password, 10)
    .then(hash => user.password = hash);
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = { User };
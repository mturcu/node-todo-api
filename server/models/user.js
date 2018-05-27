const
  mongoose = require('mongoose'),
  validator = require('validator'),
  jwt = require('jsonwebtoken'),
  _ = require('lodash');

const secret = 'S3KR3T';

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
  var user = this;
  const access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, secret).toString();
  user.tokens = user.tokens.concat({access, token});
  return user.save().then(() => token);
}

var User = mongoose.model('User', UserSchema);

module.exports = { User };
const mongoose = require('mongoose'),
  timestamp = require('mongoose-timestamp'),
  userDebug = require('debug')('app:User'),
  bcrypt = require('bcryptjs'),
  Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 55,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    trim: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true
  }
});

// Methods
// Hash password
UserSchema.methods.hashPassword = function(cb) {
  // Generate salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      userDebug('bcrypt gensalt error', err);
    }
    // Hash password
    bcrypt.hash(this.password, salt, (err, hashed) => {
      if (err) {
        userDebug('bcrypt hashing error', err);
      }
      this.password = hashed;
      cb();
    });
  });
};

// Compare password
UserSchema.methods.comparePassword = function(passEntered, cb) {
  bcrypt.compare(passEntered, this.password, (err, isMatch) => {
    if (err) {
      userDebug('bcrypt comapre error', err);
    }
    cb(isMatch);
  });
};
// Add the timestamps
UserSchema.plugin(timestamp);
// Create model
const User = mongoose.model('User', UserSchema);
module.exports = User;

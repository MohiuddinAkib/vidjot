const mongoose = require('mongoose'),
  timestamp = require('mongoose-timestamp'),
  Schema = mongoose.Schema;

// Create Schema
const IdeaSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 55,
    trim: true
  },
  details: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 5000,
    trim: true
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

// Add the timestamps
IdeaSchema.plugin(timestamp);
// Create model
const Idea = mongoose.model('Idea', IdeaSchema);
module.exports = Idea;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },

  // Gamification
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  badges: {
    type: [String],
    default: [],
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastCompletedDate: {
    type: Date,
    default: null,
  },
  totalCompleted: {
    type: Number,
    default: 0,
  },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true
  },
  dob: {
    type: Date,
    required: [true, 'Please provide your date of birth']
  },
  plan: {
    type: String,
    required: [true, 'Please select a plan'],
    enum: ['1month', '2month', '3month', '6month', 'yearly']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'online']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'pending'],
    default: 'pending'
  }
}, { timestamps: true });

// Add a method to check if subscription is expired
UserSchema.methods.isExpired = function() {
  return new Date() > new Date(this.endDate);
};

module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');

const cachedJobSchema = new mongoose.Schema({
  adzunaId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  employerName: {
    type: String,
    default: 'Aggregated Partner'
  },
  description: {
    type: String,
    required: true
  },
  skills: [{ type: String }],
  workersNeeded: { type: Number, default: 1 },
  workersHired: { type: Number, default: 0 },
  payPerDay: { type: Number, required: true },
  
  location: {
    area: String,
    city: { type: String, default: 'Bhubaneswar' },
    district: { type: String, default: 'Khordha' },
    state: { type: String, default: 'Odisha' }
  },

  duration: { type: String, default: 'Ongoing' },
  contactPhone: { type: String, default: '9876543210' },
  isUrgent: { type: Boolean, default: false },
  icon: { type: String, default: '💼' },
  experienceRequired: {
    type: String,
    default: 'none'
  },

  postedAt: { type: Date, default: Date.now },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Mongoose automatic TTL index: document will self-delete in exactly 24 hours (86400 seconds)!
  }
});

module.exports = mongoose.model('CachedJob', cachedJobSchema);

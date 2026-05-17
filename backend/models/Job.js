const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'construction', 'cleaning', 'delivery', 'domestic', 'agriculture',
      'security', 'loading', 'it_tech', 'healthcare', 'education',
      'retail', 'hospitality', 'manufacturing', 'logistics', 'finance',
      'marketing', 'legal', 'engineering', 'design', 'admin', 'driver', 'other'
    ]
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerName: String,

  // Job Details
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  skills: [{ type: String }],
  workersNeeded: { type: Number, default: 1, min: 1 },
  workersHired: { type: Number, default: 0 },

  // Pay
  payPerDay: { type: Number, required: [true, 'Pay per day is required'] },
  payType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'hourly', 'fixed'],
    default: 'daily'
  },

  // Location
  location: {
    area: String,
    city: { type: String, default: 'Bhubaneswar' },
    district: String,
    state: { type: String, default: 'Odisha' },
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // Duration
  duration: String,
  startDate: Date,
  endDate: Date,
  workingHours: String,

  // Contact
  contactPhone: String,
  contactEmail: String,

  // Flags
  isUrgent: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Experience required
  experienceRequired: {
    type: String,
    enum: ['none', 'fresher', 'less_than_1', '1_to_3', '3_to_5', '5_plus'],
    default: 'none'
  },

  // Stats
  views: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 },

  icon: { type: String, default: '💼' },
  tags: [String],

  postedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for search
jobSchema.index({ title: 'text', description: 'text', 'location.area': 'text' });
jobSchema.index({ category: 1, isActive: 1 });
jobSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('Job', jobSchema);

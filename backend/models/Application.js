const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Applicant filled details (at time of applying)
  applicantDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: {
      area: String,
      city: String,
      district: String,
      pincode: String
    },
    experience: {
      type: String,
      enum: ['fresher', 'less_than_1', '1_to_3', '3_to_5', '5_plus'],
      default: 'fresher'
    },
    experienceYears: String,
    currentJobTitle: String,
    skills: [String],
    expectedPay: Number,
    availability: {
      type: String,
      enum: ['immediate', 'within_week', 'within_month'],
      default: 'immediate'
    },
    languages: [String],
    education: String,
    coverNote: String,
    hasOwnVehicle: Boolean,
    hasDrivingLicense: Boolean
  },

  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'hired', 'rejected', 'withdrawn'],
    default: 'pending'
  },

  employerNote: String,
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// One application per job per user
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

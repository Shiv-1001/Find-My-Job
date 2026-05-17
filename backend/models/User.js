const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  role: {
    type: String,
    enum: ['worker', 'employer'],
    default: 'worker'
  },

  // Location
  address: {
    street: String,
    area: String,
    city: { type: String, default: 'Bhubaneswar' },
    district: String,
    state: { type: String, default: 'Odisha' },
    pincode: String
  },

  // Worker-specific
  experience: {
    type: String,
    enum: ['fresher', 'less_than_1', '1_to_3', '3_to_5', '5_plus'],
    default: 'fresher'
  },
  skills: [{ type: String }],
  currentJobTitle: String,
  expectedPay: Number,
  availability: {
    type: String,
    enum: ['immediate', 'within_week', 'within_month'],
    default: 'immediate'
  },
  languages: [{ type: String }],
  education: String,
  profilePhoto: String,
  bio: String,

  // Stats
  totalJobsDone: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },

  // Employer-specific
  companyName: String,
  companyType: String,

  // System
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for average rating
userSchema.virtual('avgRating').get(function() {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : 0;
});

module.exports = mongoose.model('User', userSchema);

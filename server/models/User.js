const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  otpType: {
    type: String,
    enum: ['verify', 'login', 'reset', 'change'],
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  lastLoginDuration: {
    type: Number,
    default: 0,
  },
  loginHistory: [
    {
      loginTime: { type: Date },
      logoutTime: { type: Date },
      duration: { type: Number },
    }
  ],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function (type) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otpType = type;
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (enteredOTP, type) {
  if (this.otpType !== type) return { valid: false, message: 'Invalid OTP type' };
  if (!this.otp || !this.otpExpiry) return { valid: false, message: 'No OTP found' };
  if (new Date() > this.otpExpiry) return { valid: false, message: 'OTP has expired' };
  if (this.otp !== enteredOTP) return { valid: false, message: 'Invalid OTP' };
  return { valid: true };
};

// Clear OTP after use
userSchema.methods.clearOTP = function () {
  this.otp = null;
  this.otpExpiry = null;
  this.otpType = null;
};

module.exports = mongoose.model('User', userSchema);
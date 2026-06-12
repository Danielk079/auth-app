const express = require('express');
const { protect } = require('../middleware/protect');
const {
  registerUser,
  verifyEmailOTP,
  loginUser,
  verifyLoginOTP,
  logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyChangePassword,
  resendOTP,
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/verify-email', verifyEmailOTP);
router.post('/login', loginUser);
router.post('/verify-login', verifyLoginOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

// Private routes (require login)
router.post('/logout', protect, logoutUser);
router.post('/change-password', protect, changePassword);
router.post('/verify-change-password', protect, verifyChangePassword);

module.exports = router;
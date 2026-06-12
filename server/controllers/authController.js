const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendOTPEmail = require('../utils/sendEmail');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, adminSecret } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // If registering as admin, verify secret code
    if (role === 'admin') {
      if (!adminSecret) {
        return res.status(400).json({ error: 'Admin secret code is required' });
      }
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: 'Invalid admin secret code' });
      }
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({ username, email, password, role });

    // Generate OTP for email verification
    const otp = user.generateOTP('verify');
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, 'verify');

    res.status(201).json({
      message: 'Registration successful! Please check your email for the OTP.',
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Verify email OTP after registration
// @access  Public
const verifyEmailOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const result = user.verifyOTP(otp, 'verify');
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.clearOTP();
    await user.save();

    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login a user
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user has verified their email
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    // Generate login OTP for 2FA
    const otp = user.generateOTP('login');
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, 'login');

    res.json({
      message: 'OTP sent to your email. Please verify to complete login.',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Verify login OTP (2FA)
// @access  Public
const verifyLoginOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const result = user.verifyOTP(otp, 'login');
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Clear OTP
    user.clearOTP();

    // Update lastLogin
    user.lastLogin = new Date();

    // Add login session to history
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    user.loginHistory.push({
      loginTime: new Date(),
      logoutTime: null,
      duration: null,
    });

    await user.save();

    // Send back user info + token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Logout a user and record duration
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const lastSession = user.loginHistory
      .slice()
      .reverse()
      .find(session => !session.logoutTime);

    if (lastSession) {
      const logoutTime = new Date();
      const duration = Math.floor(
        (logoutTime - new Date(lastSession.loginTime)) / 1000 / 60
      );
      lastSession.logoutTime = logoutTime;
      lastSession.duration = duration;
      user.lastLoginDuration = duration;
    }

    await user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Forgot password — send OTP to email
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Always return same message — never reveal if email exists
    if (!user) {
      return res.json({
        message: 'If that email exists, an OTP has been sent',
      });
    }

    // Generate reset OTP
    const otp = user.generateOTP('reset');
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, 'reset');

    res.json({
      message: 'If that email exists, an OTP has been sent',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reset password with OTP
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const result = user.verifyOTP(otp, 'reset');
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.clearOTP();
    await user.save();

    res.json({ message: 'Password reset successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Change password (logged in user)
// @access  Private
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Generate change password OTP
    const otp = user.generateOTP('change');
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp, 'change');

    res.json({
      message: 'OTP sent to your registered email',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Verify change password OTP and update password
// @access  Private
const verifyChangePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    // Verify OTP
    const result = user.verifyOTP(otp, 'change');
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.clearOTP();
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Resend OTP
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { userId, type } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new OTP
    const otp = user.generateOTP(type);
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, otp, type);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
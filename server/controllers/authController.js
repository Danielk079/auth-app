const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

    // Send back user info + token
    res.status(201).json({
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

// @desc    Login a user
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update lastLogin
    user.lastLogin = new Date();

    // Add login session to history
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

    // Find the last login session with no logout time
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

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  logoutUser,
};
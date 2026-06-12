const User = require('../models/User');

// @desc    Get all users
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get dashboard stats
// @access  Admin only
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Users who logged in within the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyActive = await User.countDocuments({
      role: 'user',
      lastLogin: { $gte: sevenDaysAgo },
    });

    // Latest 5 registered users
    const latestUsers = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalAdmins,
      recentlyActive,
      latestUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a user
// @access  Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting another admin
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete an admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single user with full login history
// @access  Admin only
const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getStats,
  deleteUser,
  getSingleUser,
};
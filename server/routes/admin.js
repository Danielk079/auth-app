const express = require('express');
const { protect, adminOnly } = require('../middleware/protect');
const {
  getAllUsers,
  getStats,
  deleteUser,
  getSingleUser,
} = require('../controllers/adminController');

const router = express.Router();

// Apply protect and adminOnly to all routes in this file
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   GET /api/admin/stats
router.get('/stats', getStats);

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

// @route   GET /api/admin/users/:id
router.get('/users/:id', getSingleUser);

module.exports = router;
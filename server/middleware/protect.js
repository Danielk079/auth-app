const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware - checks if user is logged in
const protect = async (req, res, next) => {
    try {
        let token;

        // check if token exists in headers

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        //if no token found

        if (!token) {
            return res.status(401).json({ error: 'Not authorized, no token' });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database using id from token
        req.user = await User.findById(decoded.id).select('-password');

        next();

    } catch (error) {
        res.status(401).json({ error: 'Not authorized, invalid token' });
    }
};

// Admin middleware - checks if user is an admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized, admin only'});
    }
};

module.exports = { protect, adminOnly };
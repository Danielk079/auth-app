const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

//generate a JWT token 

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @route POST /api/auth/register
// @desc Register a new User
// @acess Public

router.post('/register', async (req, res) => {
    try{
        const { username, email, password } = req.body;

        //check if all fields are provided

        if(!username || !email || !password){
            return res.status(400).json({ error: 'All fields are required'});
        }

        //check if user already exists

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // create new user
        const user = await User.create({ username, email, password });

        // send back user info + token
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route POST /api/auth/login
// @desc Login a user
// @access Public

router.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;

        // check if all fields are profided 

        if(!email || !password){
            return res.status(400).json({ error: 'All fields are required' });
        }

        // find user by email

        const user = await User.findOne({ email });

        //check if user exists and password matches
        if (!user || !(await user.matchPassword(password))) {
             return res.status(401).json({ error: 'Invalid email or password'});
        }

        // send back user info + token
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
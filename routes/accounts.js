const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Access environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h'; // Default to 1h if not set

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
}

// Register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'Account created successfully' });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: 'Username already exists' });
        } else {
            res.status(500).json({ message: 'Server error', error: err });
        }
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

        const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        const refreshToken = jwt.sign({ username }, JWT_REFRESH_SECRET);

        res.json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Get all users (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Update a user (protected)
router.put('/:username', authenticateToken, async (req, res) => {
    const { username } = req.params;
    const { password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await User.findOneAndUpdate(
            { username },
            { password: hashedPassword },
            { new: true }
        );

        if (!result) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Account updated successfully', user: result });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Delete a user (protected)
router.delete('/:username', authenticateToken, async (req, res) => {
    const { username } = req.params;

    try {
        const result = await User.findOneAndDelete({ username });
        if (!result) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

module.exports = router;

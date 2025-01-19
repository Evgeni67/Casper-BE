const express = require('express');
const Exercise = require('../models/Exercise');
const jwt = require('jsonwebtoken');
const router = express.Router();

require('dotenv').config(); // Ensure .env is loaded
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer token format: "Bearer <token>"
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user; // Optionally attach user info from the token payload
        next();
    });
}

// Create multiple exercises
router.post('/bulk', authenticateToken, async (req, res) => {
    const exercises = req.body; // Expecting an array of exercises
    if (!Array.isArray(exercises)) {
        return res.status(400).json({ message: 'Input must be an array of exercises' });
    }

    try {
        const savedExercises = await Exercise.insertMany(exercises);
        res.status(201).json({ message: 'Exercises created successfully', savedExercises });
    } catch (err) {
        res.status(400).json({ message: 'Failed to create exercises', error: err.message });
    }
});

// Create an exercise (protected)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const exercise = new Exercise(req.body);
        await exercise.save();
        res.status(201).json({ message: 'Exercise created successfully', exercise });
    } catch (err) {
        res.status(400).json({ message: 'Failed to create exercise', error: err.message });
    }
});

// Get all exercises (protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.status(200).json(exercises);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch exercises', error: err.message });
    }
});

// Get an exercise by ID (protected)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);
        if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
        res.status(200).json(exercise);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch exercise', error: err.message });
    }
});

// Update an exercise (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
        res.status(200).json({ message: 'Exercise updated successfully', exercise });
    } catch (err) {
        res.status(400).json({ message: 'Failed to update exercise', error: err.message });
    }
});

// Delete an exercise (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const exercise = await Exercise.findByIdAndDelete(req.params.id);
        if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
        res.status(200).json({ message: 'Exercise deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete exercise', error: err.message });
    }
});

module.exports = router;

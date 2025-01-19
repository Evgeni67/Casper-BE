const express = require('express');
const Module = require('../models/Module');
const jwt = require('jsonwebtoken');
const router = express.Router();

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

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

// Create a new module
router.post('/', authenticateToken, async (req, res) => {
    try {
        const module = new Module({ title: req.body.title, exercises: [] });
        await module.save();
        res.status(201).json({ message: 'Module created successfully', module });
    } catch (err) {
        res.status(400).json({ message: 'Failed to create module', error: err.message });
    }
});

// Edit a module title
router.put('/:moduleId', authenticateToken, async (req, res) => {
    try {
        const module = await Module.findByIdAndUpdate(
            req.params.moduleId,
            { title: req.body.title },
            { new: true }
        );
        if (!module) return res.status(404).json({ message: 'Module not found' });
        res.status(200).json({ message: 'Module updated successfully', module });
    } catch (err) {
        res.status(400).json({ message: 'Failed to update module', error: err.message });
    }
});

// Delete a module
router.delete('/:moduleId', authenticateToken, async (req, res) => {
    try {
        const module = await Module.findByIdAndDelete(req.params.moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        res.status(200).json({ message: 'Module deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete module', error: err.message });
    }
});

// Add an exercise to a module
router.post('/:moduleId/exercises', authenticateToken, async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });

        const exercise = { title: req.body.title, description: req.body.description };
        module.exercises.push(exercise);
        await module.save();

        res.status(201).json({ message: 'Exercise added successfully', module });
    } catch (err) {
        res.status(400).json({ message: 'Failed to add exercise', error: err.message });
    }
});

// Edit an exercise in a module
router.put('/:moduleId/exercises/:exerciseId', authenticateToken, async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });

        const exercise = module.exercises.id(req.params.exerciseId);
        if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

        exercise.title = req.body.title || exercise.title;
        exercise.description = req.body.description || exercise.description;
        await module.save();

        res.status(200).json({ message: 'Exercise updated successfully', module });
    } catch (err) {
        res.status(400).json({ message: 'Failed to update exercise', error: err.message });
    }
});

// Remove an exercise from a module
router.delete('/:moduleId/exercises/:exerciseId', authenticateToken, async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });

        const exercise = module.exercises.id(req.params.exerciseId);
        if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

        exercise.remove();
        await module.save();

        res.status(200).json({ message: 'Exercise removed successfully', module });
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove exercise', error: err.message });
    }
});

module.exports = router;

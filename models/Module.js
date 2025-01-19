const mongoose = require('../database/mongoose');

const exerciseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    exercises: [exerciseSchema], // Array of exercises
}, { timestamps: true });

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;

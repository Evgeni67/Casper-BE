const mongoose = require('mongoose');
require('dotenv').config(); // Ensure .env is loaded

// MongoDB connection string
const mongoURI = process.env.MONGO_URI; // Replace with your MongoDB URI

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

module.exports = mongoose;

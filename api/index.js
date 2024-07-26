const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Use built-in middleware for JSON parsing

// Connect to MongoDB
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("DB connection successful.");
    })
    .catch((err) => {
        console.error(`DB connection error: ${err}`);
    });

// Check the connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define Routes
app.use('/api/products', require('./routes/productsRoutes'));

// Root route for health check
app.get('/', (req, res) => {
    res.send('API is working');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;

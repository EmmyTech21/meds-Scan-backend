const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
}));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE)
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
app.use('/api/reports', require('./routes/reportRoutes')); 

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

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { GridFSBucket } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const productRoutes = require('./routes/productsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const teamRoutes = require('./routes/teamRoutes');
const manufacturerRoutes = require('./routes/manufacturer');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors({ 
  origin: ['http://localhost:5173', 'https://meds-scan-backend.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE)
  .then(() => {
    console.log('MongoDB connected');
    // Initialize GridFSBucket after MongoDB connection
    app.locals.bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'pdfs' });
    console.log('GridFSBucket initialized');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.send('API is working'));
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve PDF files from GridFS
app.get('/pdfs/:fileId', (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const bucket = app.locals.bucket;

    if (!bucket) {
      throw new Error('GridFSBucket is not initialized');
    }

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('end', () => {
      res.end();
    });

    downloadStream.on('error', (err) => {
      console.error('Error retrieving PDF:', err);
      res.status(500).send({ message: 'Error retrieving PDF', error: err.message });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send({ message: 'Internal server error', error: error.message });
  }
});


const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

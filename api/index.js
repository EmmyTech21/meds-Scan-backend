const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const http = require('http');

const productRoutes = require('./routes/productsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const teamRoutes = require('./routes/teamRoutes');
const manufacturerRoutes = require('./routes/manufacturer');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

app.use(cors({ 
  origin: ['http://localhost:5173', 'https://meds-scan-backend.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

mongoose.connect(process.env.DATABASE)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('API is working');
});

app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/dashboard', dashboardRoutes);

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

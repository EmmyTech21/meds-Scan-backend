const express = require('express');
const router = express.Router();
const manufacturerController = require('../controllers/manufacturerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, manufacturerController.createManufacturer);
router.get('/dashboard', authMiddleware, manufacturerController.getManufacturerDashboardData);

module.exports = router;

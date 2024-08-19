const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/sales-trend', authMiddleware, dashboardController.getDashboardData);
router.get('/market-share', authMiddleware, dashboardController.getDashboardData);
router.get('/top-products', authMiddleware, dashboardController.getDashboardData);

module.exports = router;

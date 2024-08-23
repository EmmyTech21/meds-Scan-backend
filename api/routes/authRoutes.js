const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);


router.post('/login', authController.login);

router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.delete('/profile', authMiddleware, authController.deleteProfile);


router.get('/user', authMiddleware, authController.getProfile);

module.exports = router;
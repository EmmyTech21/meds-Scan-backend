const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Register new user (Public Route)
router.post("/register", authController.register);

// Login user (Public Route)
router.post("/login", authController.login);

// Get user profile (Authenticated Route)
router.get("/profile", authMiddleware, authController.getProfile);

// Update user profile (Authenticated Route)
router.put("/profile", authMiddleware, authController.updateProfile);

// Delete user profile (Authenticated Route)
router.delete("/profile", authMiddleware, authController.deleteProfile);

// Remove redundant route
// If you need a separate route for some reason, ensure it has a unique purpose or path

module.exports = router;

const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authenticateUser = require('../middleware/authMiddleware');

router.post('/', authenticateUser, teamController.addTeamMember); // Changed to match '/api/team'
router.get('/', authenticateUser, teamController.getTeamMembers); // Changed to match '/api/team'
router.delete('/:id', authenticateUser, teamController.deleteTeamMember); // Ensure ':id' is used for deletion

module.exports = router;

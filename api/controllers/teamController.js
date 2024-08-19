const TeamMember = require('../models/teamMember');

// Add a team member
exports.addTeamMember = async (req, res) => {
  try {
    const userId = req.user.userId; // Ensure this matches the key used in your middleware
    const { name, email, phone, position } = req.body;

    const newTeamMember = new TeamMember({
      userId, // Attach userId here
      name,
      email,
      phone,
      position
    });

    await newTeamMember.save();
    res.status(201).json(newTeamMember);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all team members for the authenticated user
exports.getTeamMembers = async (req, res) => {
  try {
    const userId = req.user.userId; // Ensure this matches the key used in your middleware
    const members = await TeamMember.find({ userId });
    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMemberId = req.params.id; // Use 'id' from route parameters
    const userId = req.user.userId; // Ensure this matches the key used in your middleware

    const member = await TeamMember.findOneAndDelete({ _id: teamMemberId, userId });
    
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

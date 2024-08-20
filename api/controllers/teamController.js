const TeamMember = require('../models/teamMember');


exports.addTeamMember = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { name, email, phone, position } = req.body;

    const newTeamMember = new TeamMember({
      userId, 
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

exports.getTeamMembers = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const members = await TeamMember.find({ userId });
    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const teamMemberId = req.params.id; 
    const userId = req.user.userId; 

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

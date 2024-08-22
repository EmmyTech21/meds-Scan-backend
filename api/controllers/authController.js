const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


exports.register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, companyName,birthDate, country, password } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

   
    const newUser = new User({
      fullName,
      email,
      phoneNumber,
      companyName,
      birthDate,
      country,
      password, 
    });

    await newUser.save();

    
    const token = generateToken(newUser._id);

    res.status(201).json({ message: 'Account created successfully', token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

   
    const token = generateToken(user._id);

    res.status(200).json({ token, userId: user._id, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, country, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, email, country, role }, 
      { new: true } 
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.deleteProfile = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
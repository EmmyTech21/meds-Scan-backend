const User = require("../models/userModel");
const KYC = require("../models/kycModel");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      agreeToTerms,
      role,
      ...kycData // Extract KYC data separately
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({
      fullName,
      email,
      phone,
      password,
      agreeToTerms,
      role,
    });

    // Save the user
    await newUser.save();

    // If role requires KYC data, validate and create KYC entry
    if (role !== "user") {
      // Perform additional validation on KYC fields if needed
      if (!kycData.businessName || !kycData.businessLocation) {
        return res.status(400).json({
          message: "KYC validation failed: businessName and businessLocation are required.",
        });
      }

      const kyc = new KYC({
        userId: newUser._id,
        ...kycData,
      });
      await kyc.save();
    }

    // Generate a JWT token
    const token = generateToken(newUser._id);

    res.status(201).json({ message: "Account created successfully", token });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({ token, userId: user._id, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const kyc = await KYC.findOne({ userId: user._id });

    res.status(200).json({ user, kyc });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, role, ...kycData } = req.body;

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { fullName, email, role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update KYC if needed
    if (role !== "user") {
      const updatedKYC = await KYC.findOneAndUpdate(
        { userId: req.user.userId },
        kycData,
        { new: true, upsert: true }
      );
    }

    res.status(200).json({ message: "Profile updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user profile
exports.deleteProfile = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete associated KYC data
    await KYC.findOneAndDelete({ userId: req.user.userId });

    res.status(200).json({ message: "User and KYC data deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
      ...kycData
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role !== role) {
        return res.status(400).json({ message: "User already exists with a different role" });
      } else {
        return res.status(400).json({ message: "User already exists" });
      }
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
      const kycErrors = validateKYCData(kycData);
      if (kycErrors.length > 0) {
        // Remove the created user if KYC data validation fails
        await User.deleteOne({ _id: newUser._id });
        return res.status(400).json({ message: "KYC validation failed", errors: kycErrors });
      }

      // Create KYC entry
      const kyc = new KYC({
        userId: newUser._id,
        ...kycData
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

// Helper function to validate KYC data
const validateKYCData = (kycData) => {
  const errors = [];
  if (!kycData.businessName) errors.push("Business Name is required.");
  if (!kycData.businessLocation) errors.push("Business Location is required.");
  // Add more validation checks as needed
  return errors;
};


// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the role matches
    if (user.role !== role) {
      return res.status(400).json({ message: "Incorrect role for this email" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({ userId: user._id, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

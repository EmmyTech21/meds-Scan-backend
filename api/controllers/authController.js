const User = require("../models/userModel");
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
      businessName,
      businessLocation,
      businessRegistrationNumber,
      cacCertImage,
      nafdacRegistrationCertificates,
      manufacturingAddress,
      corporateOfficeAddress,
      operationalPermits,
      distributionCenterAddress,
      pharmacyRegistrationDocs,
      storeProfile,
      ownerOrManager,
      proofOfOwnership,
      contactPersons,
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
      businessName,
      businessLocation,
      businessRegistrationNumber,
      cacCertImage,
      nafdacRegistrationCertificates,
      manufacturingAddress,
      corporateOfficeAddress,
      operationalPermits,
      distributionCenterAddress,
      pharmacyRegistrationDocs,
      storeProfile,
      ownerOrManager,
      proofOfOwnership,
      contactPersons,
    });

    // Save the user
    await newUser.save();

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

    res
      .status(200)
      .json({ token, userId: user._id, message: "Login successful" });
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
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      country,
      role,
      businessName,
      businessLocation,
      businessRegistrationNumber,
      taxIdentificationNumber,
      govtIdImage,
      cacCertImage,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        fullName,
        email,
        country,
        role,
        businessName,
        businessLocation,
        businessRegistrationNumber,
        taxIdentificationNumber,
        govtIdImage,
        cacCertImage,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
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

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

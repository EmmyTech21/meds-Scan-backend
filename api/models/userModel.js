const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const contactPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  phone: { type: String, required: true },
  agreeToTerms: { type: Boolean },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["manufacturer", "distributor", "store", "user"],
    default: "distributor",
  },

  // KYC Fields
  businessName: { type: String, required: true },
  businessLocation: { type: String, required: true },
  businessRegistrationNumber: { type: String },
  cacCertImage: { type: String },

  // Manufacturer Specific Fields
  nafdacRegistrationCertificates: [{ type: String }],
  manufacturingAddress: { type: String },
  corporateOfficeAddress: { type: String },

  // Distributor Specific Fields
  operationalPermits: [{ type: String }],
  distributionCenterAddress: { type: String },

  // Store/Pharmacy Specific Fields
  pharmacyRegistrationDocs: [{ type: String }],
  storeProfile: { type: String }, 
  ownerOrManager: {
    idDocuments: [{ type: String }],
    proofOfAddress: { type: String }, 
    cv: { type: String }, 
  },
  proofOfOwnership: { type: String },

  // Common KYC Fields
  contactPersons: [contactPersonSchema], // Array of contact persons

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.pre("save", function (next) {
  if (this.role === "manufacturer") {
    this.operationalPermits = undefined;
    this.distributionCenterAddress = undefined;
    this.pharmacyRegistrationDocs = undefined;
    this.storeProfile = undefined;
    this.ownerOrManager = undefined;
    this.proofOfOwnership = undefined;
  } else if (this.role === "distributor") {
    this.nafdacRegistrationCertificates = undefined;
    this.manufacturingAddress = undefined;
    this.corporateOfficeAddress = undefined;
    this.pharmacyRegistrationDocs = undefined;
    this.storeProfile = undefined;
    this.ownerOrManager = undefined;
    this.proofOfOwnership = undefined;
  } else if (this.role === "store") {
    this.nafdacRegistrationCertificates = undefined;
    this.manufacturingAddress = undefined;
    this.corporateOfficeAddress = undefined;
    this.operationalPermits = undefined;
    this.distributionCenterAddress = undefined;
  } else if (this.role === "user") {
    // Assuming 'user' role might not need any business or KYC details
    // dev modifying this can correct it if it is needed
    this.businessName = undefined;
    this.businessLocation = undefined;
    this.businessRegistrationNumber = undefined;
    this.cacCertImage = undefined;
    this.nafdacRegistrationCertificates = undefined;
    this.manufacturingAddress = undefined;
    this.corporateOfficeAddress = undefined;
    this.operationalPermits = undefined;
    this.distributionCenterAddress = undefined;
    this.pharmacyRegistrationDocs = undefined;
    this.storeProfile = undefined;
    this.ownerOrManager = undefined;
    this.proofOfOwnership = undefined;
    this.contactPersons = undefined;
  }

  next();
});


const User = mongoose.model("User", userSchema);
module.exports = User;

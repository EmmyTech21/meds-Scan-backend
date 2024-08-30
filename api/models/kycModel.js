const mongoose = require("mongoose");
const contactPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const KYC = mongoose.model("KYC", kycSchema);
module.exports = KYC;

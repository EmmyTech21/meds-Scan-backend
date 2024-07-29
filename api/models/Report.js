const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  image: { type: String, default: null }, // Make the image field optional
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

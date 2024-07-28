const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  image: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

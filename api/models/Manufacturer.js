const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  manufacturerName: String,
  contactPerson: String,
  email: String,
  phoneNumber: String,
  productCategory: String,
  topProducts: [{ productName: String, sales: Number }], // Array of top products
  marketShare: {
    pot1: Number,
    pot2: Number,
    pot3: Number,
    pot4: Number,
  }, // Object for market share
  salesTrend: [{ day: String, sales: Number }], // Array for sales trend
  regions: [{ name: String, sales: Number }], // Array for regional distribution data
  userId: mongoose.Schema.Types.ObjectId,
});

const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);

module.exports = Manufacturer;

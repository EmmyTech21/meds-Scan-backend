const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  manufacturerName: String,
  contactPerson: String,
  email: String,
  phoneNumber: String,
  productCategory: String,
  topProducts: [{ productName: String, sales: Number }], 
  marketShare: {
    pot1: Number,
    pot2: Number,
    pot3: Number,
    pot4: Number,
  }, 
  salesTrend: [{ day: String, sales: Number }], 
  regions: [{ name: String, sales: Number }], 
  userId: mongoose.Schema.Types.ObjectId,
});

const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);

module.exports = Manufacturer;

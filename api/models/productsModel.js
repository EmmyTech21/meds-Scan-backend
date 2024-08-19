const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  manufacturerName: String,  // Include manufacturerName in the schema
  contactPerson: String,
  emailAddress: String,
  phoneNumber: String,
  manufacturedDate: Date,   // Add manufacturedDate, expiryDate, batchNumber, nafdacRegistration
  expiryDate: Date,
  batchNumber: String,
  nafdacRegistration: String,
});

const productSchema = new mongoose.Schema({
  productName: String,
  productCategory: String,
  productDescription: String,
  issn: Number,
});

const packageSchema = new mongoose.Schema({
  quantityPerPackage: Number, // Updated fields to match the form inputs
  howManyPackage: Number,
  productsPerPackage: Number,
  currentHumidity: String,
  currentTemperature: String,
  productComponent: String,
});

const productDetailsSchema = new mongoose.Schema({
  manufacturerInformation: manufacturerSchema,
  productInformation: productSchema,
  packageInformation: packageSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
});

module.exports = mongoose.model('Product', productDetailsSchema);

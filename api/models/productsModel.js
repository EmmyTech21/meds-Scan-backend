const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  manufacturerName: String, 
  contactPerson: String,
  emailAddress: String,
  phoneNumber: String,
  manufacturedDate: Date,  
  expiryDate: Date,
  batchNumber: String,
  nafdacRegistration: String,
});

const productSchema = new mongoose.Schema({
  productName: String,
  productCategory: String,
  productDescription: String,
});

const packageSchema = new mongoose.Schema({
  quantityPerPackage: Number, 
  howManyPackage: Number,
  productsPerPackage: Number,
  currentHumidity: String,
  currentTemperature: String,
  productComponent: String,
  productCodes: [String], // Array to store unique codes for each product in the package
});

const productDetailsSchema = new mongoose.Schema({
  manufacturerInformation: manufacturerSchema,
  productInformation: productSchema,
  packageInformation: packageSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
});

module.exports = mongoose.model('Product', productDetailsSchema);

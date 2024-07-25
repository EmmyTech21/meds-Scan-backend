const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  manufacturerName: String,
  contactPerson: String,
  emailAddress: String,
  phoneNumber: String,
});

const productSchema = new mongoose.Schema({
  productName: String,
  productCategory: String,
  productDescription: String,
  issn: Number,
});

const packageSchema = new mongoose.Schema({
  packageSize: Number,
  totalPackages: Number,
  sku: Number,
});

const productDetailsSchema = new mongoose.Schema({
  manufacturerInformation: manufacturerSchema,
  productInformation: productSchema,
  packageInformation: packageSchema,
});

module.exports = mongoose.model('Product', productDetailsSchema);


const Product = require('../models/productsModel');
const mongoose = require('mongoose');
const { MongoClient, GridFSBucket } = require('mongodb');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
require('dotenv').config();

const uri = process.env.DATABASE;
const client = new MongoClient(uri);
let bucket;

// Ensure the bucket is initialized properly
async function initializeBucket() {
  if (!bucket) {
    await client.connect();
    const db = client.db('test'); 
    bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    console.log('Connected to MongoDB and GridFS bucket initialized');
  }
  return bucket;
}

exports.createProduct = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      console.error("User ID is missing");
      return res.status(400).send({ message: "User ID is missing" });
    }

    const { manufacturerInformation, productInformation, packageInformation } = req.body;

    if (
      !productInformation.productName ||
      !productInformation.productCategory ||
      !productInformation.productDescription
    ) {
      return res.status(400).send({ message: "Missing required product fields" });
    }

    if (
      !manufacturerInformation.manufacturerName ||
      !manufacturerInformation.manufacturedDate ||
      !manufacturerInformation.expiryDate ||
      !manufacturerInformation.nafdacRegistration
    ) {
      return res.status(400).send({ message: "Missing required manufacturer fields" });
    }

    if (
      !packageInformation.howManyPackage ||
      !packageInformation.productsPerPackage ||
      !packageInformation.currentHumidity ||
      !packageInformation.currentTemperature ||
      !packageInformation.productComponent
    ) {
      return res.status(400).send({ message: "Missing required package fields" });
    }

    const totalProducts =
      packageInformation.productsPerPackage * packageInformation.howManyPackage;

    // Generate unique product codes
    const productCodes = [];
    for (let i = 0; i < totalProducts; i++) {
      const uniqueCode = crypto.randomBytes(8).toString("hex");
      productCodes.push(uniqueCode);
    }
    packageInformation.productCodes = productCodes;

    // Save the new product
    const newProduct = new Product({
      manufacturerInformation,
      productInformation,
      packageInformation,
      userId,
    });
    await newProduct.save();

    // Initialize GridFS bucket
    const bucket = await initializeBucket();

    // Create PDF
    const doc = new PDFDocument();
    const pdfBuffer = [];

    doc.on('data', pdfBuffer.push.bind(pdfBuffer));
    doc.on('end', async () => {
      const pdfContent = Buffer.concat(pdfBuffer);

      // Upload PDF to GridFS
      const uploadStream = bucket.openUploadStream(`${newProduct._id}_codes.pdf`);
      uploadStream.end(pdfContent);

      // Generate the download URL
      const pdfUrl = `/pdfs/${uploadStream.id}`;

      const blockchainAddress = `mock-blockchain-address-${newProduct._id}`;

      res.status(201).json({
        message: "Product created successfully",
        pdfUrl,
        blockchainAddress,
      });
    });

    doc.fontSize(16).text("Product Codes:", { underline: true });
    doc.moveDown();

    // Add product codes to the PDF
    for (const [index, code] of productCodes.entries()) {
      doc.text(`${index + 1}. ${code}`);
    }

    doc.end();
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send({ message: "Failed to create product", error: error.message });
  }
};



exports.getAllProducts = async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  if (!userId) {
    return res.status(400).send({ message: 'User ID is required' });
  }

  try {
    const products = await Product.find({ userId });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ message: 'Failed to fetch products', error: error.message });
  }
};

exports.getProductByUniqueCode = async (req, res) => {
  const { uniqueCode } = req.query;
  const userId = req.user?.id;

  if (!uniqueCode) {
    return res.status(400).send({ message: 'Unique code is required' });
  }

  if (!userId) {
    return res.status(401).send({ message: 'User is not authenticated' });
  }

  try {
    const product = await Product.findOne({
      'packageInformation.productCodes': uniqueCode,
    });

    if (product) {
      return res.status(200).json(product);
    } else {
      console.log('Product not found for uniqueCode:', uniqueCode);
      return res.status(404).send({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).send({ message: 'Failed to fetch product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { productName, productCategory, productDescription, issn } = req.body;
  const userId = req.user?.id || req.body.userId;

  if (!userId) {
    return res.status(400).send({ message: 'User ID is required' });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { _id: productId, userId },
      { productName, productCategory, productDescription, issn },
      { new: true }
    );

    if (!product) {
      return res.status(404).send({ message: 'Product not found or unauthorized' });
    }

    // Assuming you have a function to interact with a blockchain contract
    const contract = await getContractWithRetry(userId);
    await submitTransactionWithRetry(contract, 'updateProduct', JSON.stringify(product));

    res.status(200).send({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).send({ message: 'Failed to update product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user?.id || req.body.userId;

  if (!userId) {
    return res.status(400).send({ message: 'User ID is required' });
  }

  try {
    const product = await Product.findOneAndDelete({ _id: productId, userId });

    if (!product) {
      return res.status(404).send({ message: 'Product not found or unauthorized' });
    }

    // Assuming you have a function to interact with a blockchain contract
    const contract = await getContractWithRetry(userId);
    await submitTransactionWithRetry(contract, 'deleteProduct', productId);

    res.status(200).send({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send({ message: 'Failed to delete product', error: error.message });
  }
};

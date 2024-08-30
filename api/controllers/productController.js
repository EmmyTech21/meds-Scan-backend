const Product = require('../models/productsModel');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.createProduct = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      console.error('User ID is missing');
      return res.status(400).send({ message: 'User ID is missing' });
    }

    const { manufacturerInformation, productInformation, packageInformation } = req.body;

    // Validate required fields
    if (!manufacturerInformation || !productInformation || !packageInformation) {
      return res.status(400).send({ message: 'Missing manufacturer, product, or package information' });
    }

    const { manufacturerName, manufacturedDate, expiryDate, batchNumber, nafdacRegistration } = manufacturerInformation;
    const { productName, productCategory, productDescription } = productInformation;
    const { productsPerPackage, howManyPackage, currentHumidity, currentTemperature, productComponent } = packageInformation;

    if (!manufacturerName || !manufacturedDate || !expiryDate || !batchNumber || !nafdacRegistration) {
      return res.status(400).send({ message: 'Missing required manufacturer information' });
    }
    if (!productName || !productCategory || !productDescription) {
      return res.status(400).send({ message: 'Missing required product information' });
    }
    if (!productsPerPackage || !howManyPackage || !currentHumidity || !currentTemperature || !productComponent) {
      return res.status(400).send({ message: 'Missing required package information' });
    }

    const totalProducts = productsPerPackage * howManyPackage;
    const productCodes = [];

    for (let i = 0; i < totalProducts; i++) {
      const uniqueCode = crypto.randomBytes(8).toString('hex');
      productCodes.push(uniqueCode);
    }

    packageInformation.productCodes = productCodes;

    const newProduct = new Product({
      manufacturerInformation,
      productInformation,
      packageInformation,
      userId,
    });

    await newProduct.save();

    // PDF Directory and Path
    const pdfDirectory = path.join(__dirname, '../public/pdfs');
    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory, { recursive: true });
    }

    const pdfFilename = `${newProduct._id}_codes.pdf`;
    const pdfPath = path.join(pdfDirectory, pdfFilename);

    // Generate PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(12).text('Product Codes:', { underline: true });
    productCodes.forEach((code, index) => {
      doc.text(`${index + 1}. ${code}`);
    });
    doc.end();

    const blockchainAddress = `mock-blockchain-address-${newProduct._id}`;

    res.status(201).send({
      message: 'Product created successfully',
      blockchainAddress,
      pdfPath: `pdfs/${pdfFilename}`  // Correct path relative to 'public'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).send({ message: 'Failed to create product', error: error.message });
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
  const userId = req.user?.id || req.query.userId;

  if (!userId) {
    return res.status(400).send({ message: 'User ID is required' });
  }

  try {
    // Search for the product where the productCode matches the uniqueCode provided
    const product = await Product.findOne({
      'packageInformation.productCodes': uniqueCode,
      userId,
    });

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).send({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send({ message: 'Failed to fetch product', error: error.message });
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
    console.error('Error updating product:', error);
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
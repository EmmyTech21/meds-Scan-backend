const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 

// Create a new product
router.post('/create', async (req, res) => {
  const product = new Product(req.body);
  try {
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Search product by IPR (GET request with query parameter)
router.get('/scan/productIPR', async (req, res) => {
  // Retrieve `issn` from query parameters
  const { issn } = req.query;
  console.log('Received ISSN:', issn);
  
  try {
    const product = await Product.findOne({ 'productInformation.issn': issn });
    if (product) {
      res.status(200).send(product);
    } else {
      res.status(404).send({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error during product search:', error);
    res.status(500).send({ message: 'Internal Server Error', error });
  }
});


// Update a product
router.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.status(200).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.status(200).send({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

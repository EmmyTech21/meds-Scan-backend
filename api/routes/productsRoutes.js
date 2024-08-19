const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Ensure userId is passed in the request body for createProduct
router.post('/create', (req, res, next) => {
  console.log('Request Body:', req.body); // Log the request body

  if (!req.body.userId) {
    return res.status(400).send({ message: 'User ID is missing' });
  }
  next();
}, productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/scan/productIPR', productController.getProductByIssn);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');


router.post('/create', (req, res, next) => {
   

  if (!req.body.userId) {
    return res.status(400).send({ message: 'User ID is missing' });
  }
  next();
}, productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/scan/productIPR', productController.getProductByUniqueCode);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;

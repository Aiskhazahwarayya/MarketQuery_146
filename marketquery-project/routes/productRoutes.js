const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const apiGuard = require('../middleware/apiGuard');
const upload = require('../middleware/upload'); 

router.get('/external/all', apiGuard, productController.getAllProducts);
router.get('/external/:id', apiGuard, productController.getProductById);

router.get('/', authenticateToken, productController.getAllProducts);
router.get('/:id', authenticateToken, productController.getProductById);

router.post('/', authenticateToken, isAdmin, upload.single('gambar'), productController.createProduct);
router.put('/:id',  authenticateToken, isAdmin, upload.single('gambar'), productController.updateProduct);
router.delete('/:id', authenticateToken, isAdmin, productController.deleteProduct);

module.exports = router;
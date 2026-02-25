const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts } = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { upload } = require('../config/s3');

// Public
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected
router.use(protect);
router.get('/my/products', restrictTo('weaver'), getMyProducts);
router.post('/', restrictTo('weaver'), (req, res, next) => { req.uploadFolder = 'products'; next(); }, upload.array('images', 8), createProduct);
router.put('/:id', restrictTo('weaver'), updateProduct);
router.delete('/:id', restrictTo('weaver'), deleteProduct);

module.exports = router;

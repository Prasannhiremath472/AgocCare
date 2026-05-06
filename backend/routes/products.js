const router = require('express').Router();
const { getProducts, getProductBySlug, getFeatured } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/:slug', getProductBySlug);

module.exports = router;

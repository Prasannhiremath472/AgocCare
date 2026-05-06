const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth, adminOnly);

router.get('/dashboard', ctrl.getDashboard);

router.get('/products', ctrl.getAllProducts);
router.post('/products', upload.single('image'), ctrl.createProduct);
router.put('/products/:id', upload.single('image'), ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

router.get('/orders', ctrl.getAllOrders);
router.put('/orders/:id/status', ctrl.updateOrderStatus);

router.get('/users', ctrl.getAllUsers);

router.post('/categories', ctrl.createCategory);

module.exports = router;

const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const bulk   = require('../controllers/bulkUploadController');
const { auth, adminOnly } = require('../middleware/auth');
const upload  = require('../middleware/upload');
const multer  = require('multer');

// In-memory storage for bulk upload (excel + zip)
const bulkUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
}).fields([
  { name: 'excel', maxCount: 1 },
  { name: 'images', maxCount: 1 },
]);

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

router.post('/bulk-upload', bulkUploadMiddleware, bulk.bulkUpload);

module.exports = router;

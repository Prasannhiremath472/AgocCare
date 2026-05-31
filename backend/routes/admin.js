const router  = require('express').Router();
const ctrl    = require('../controllers/adminController');
const bulk    = require('../controllers/bulkUploadController');
const { auth, adminOnly } = require('../middleware/auth');
const upload  = require('../middleware/upload');
const multer  = require('multer');

const bulkMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
}).fields([
  { name: 'excel',  maxCount: 1 },
  { name: 'images', maxCount: 1 },
]);

router.use(auth, adminOnly);

router.get('/dashboard', ctrl.getDashboard);

router.get('/products',        ctrl.getAllProducts);
router.post('/products',       ctrl.createProduct);
router.put('/products/:id',    ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// Product gallery images
router.get('/products/:id/images',              ctrl.getProductImages);
router.post('/products/:id/images',             ctrl.addProductImage);
router.delete('/products/:id/images/:imgId',    ctrl.deleteProductImage);
router.put('/products/:id/images/reorder',      ctrl.reorderProductImages);

router.get('/orders',            ctrl.getAllOrders);
router.get('/orders/:id',        ctrl.getOrderDetail);
router.put('/orders/:id/status', ctrl.updateOrderStatus);

router.get('/users', ctrl.getAllUsers);

router.get('/categories',        ctrl.getAllCategories);
router.post('/categories',       ctrl.createCategory);
router.put('/categories/:id',    ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

router.post('/bulk-upload', bulkMiddleware, bulk.bulkUpload);

router.get('/audit-logs', ctrl.getAuditLogs);

module.exports = router;

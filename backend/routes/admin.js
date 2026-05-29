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

router.get('/orders',            ctrl.getAllOrders);
router.get('/orders/:id',        ctrl.getOrderDetail);
router.put('/orders/:id/status', ctrl.updateOrderStatus);

router.get('/users', ctrl.getAllUsers);

router.post('/categories', ctrl.createCategory);

router.post('/bulk-upload', bulkMiddleware, bulk.bulkUpload);

router.get('/audit-logs', ctrl.getAuditLogs);

module.exports = router;

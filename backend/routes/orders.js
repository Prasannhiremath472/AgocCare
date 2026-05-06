const router = require('express').Router();
const { createOrder, getUserOrders, getOrderById } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createOrder);
router.get('/', auth, getUserOrders);
router.get('/:id', auth, getOrderById);

module.exports = router;

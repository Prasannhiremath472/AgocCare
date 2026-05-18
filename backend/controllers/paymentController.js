const Razorpay = require('razorpay');
const crypto  = require('crypto');
const db      = require('../models/db');
const { sendOrderNotification } = require('../utils/mailer');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ message: 'order_id required' });

  try {
    const [[order]] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = "pending"',
      [order_id, req.user.id]
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const rzpOrder = await razorpay.orders.create({
      amount:          Math.round(order.total * 100), // paise
      currency:        'INR',
      receipt:         `order_${order_id}`,
      payment_capture: 1,
    });

    await db.query('UPDATE orders SET razorpay_order_id = ? WHERE id = ?', [rzpOrder.id, order_id]);

    res.json({ order_id: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Razorpay createOrder error:', err?.error || err?.message || err);
    res.status(500).json({ message: err?.error?.description || 'Payment initiation failed' });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing payment details' });
  }

  // HMAC SHA256 verification — NEVER trust frontend
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      'UPDATE orders SET status = "paid", razorpay_payment_id = ? WHERE razorpay_order_id = ? AND user_id = ?',
      [razorpay_payment_id, razorpay_order_id, req.user.id]
    );

    const [[updatedOrder]] = await conn.query(
      'SELECT id FROM orders WHERE razorpay_order_id = ?',
      [razorpay_order_id]
    );

    await conn.query(
      'INSERT INTO payments (order_id, payment_id, signature, status) VALUES (?, ?, ?, "success")',
      [updatedOrder.id, razorpay_payment_id, razorpay_signature]
    );

    await conn.commit();

    // Fetch full order + user + items for email
    try {
      const [[orderDetail]] = await db.query(
        `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM orders o JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`, [updatedOrder.id]
      );
      const [orderItems] = await db.query(
        `SELECT oi.qty, oi.price, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`, [updatedOrder.id]
      );
      const [admins] = await db.query('SELECT email FROM users WHERE role = "admin"');
      const adminEmails = admins.map(a => a.email);

      await sendOrderNotification(adminEmails, orderDetail, orderItems, razorpay_payment_id);
    } catch (mailErr) {
      console.error('[Order notification email failed]', mailErr.message);
    }

    res.json({ message: 'Payment verified', order_id: updatedOrder.id });
  } catch {
    await conn.rollback();
    res.status(500).json({ message: 'Failed to record payment' });
  } finally {
    conn.release();
  }
};

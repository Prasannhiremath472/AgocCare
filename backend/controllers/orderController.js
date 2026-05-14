const db = require('../models/db');

exports.createOrder = async (req, res) => {
  const { items, shipping_address, delivery_fee } = req.body;
  if (!items?.length || !shipping_address) {
    return res.status(400).json({ message: 'Items and shipping address required' });
  }
  const deliveryFee = parseFloat(delivery_fee) || 0;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verify stock and compute total
    let total = 0;
    for (const item of items) {
      const [[product]] = await conn.query(
        'SELECT id, price, stock FROM products WHERE id = ? AND is_active = 1 FOR UPDATE',
        [item.product_id]
      );
      if (!product) throw { status: 400, message: `Product ${item.product_id} not found` };
      if (product.stock < item.qty) throw { status: 400, message: `Insufficient stock for product ${item.product_id}` };
      total += product.price * item.qty;
    }

    // Save phone from shipping address to user profile if not already set
    try {
      const addr = JSON.parse(shipping_address);
      if (addr.phone) {
        await conn.query('UPDATE users SET phone = ? WHERE id = ? AND (phone IS NULL OR phone = "")', [addr.phone, req.user.id]);
      }
    } catch {}

    const grandTotal = total + deliveryFee;
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total, status, shipping_address) VALUES (?, ?, "pending", ?)',
      [req.user.id, grandTotal.toFixed(2), shipping_address]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const [[product]] = await conn.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.qty, product.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.product_id]);
    }

    await conn.commit();
    res.status(201).json({ order_id: orderId, total: grandTotal });
  } catch (err) {
    await conn.rollback();
    res.status(err.status || 500).json({ message: err.message || 'Order creation failed' });
  } finally {
    conn.release();
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.total, o.status, o.razorpay_order_id, o.created_at,
              JSON_ARRAYAGG(JSON_OBJECT('name', p.name, 'qty', oi.qty, 'price', oi.price)) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!orders.length) return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query(
      `SELECT oi.qty, oi.price, p.name, p.image, p.slug
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ ...orders[0], items });
  } catch {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

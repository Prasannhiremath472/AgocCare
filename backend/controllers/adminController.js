const db = require('../models/db');
const path = require('path');
const fs = require('fs');

// Products
exports.createProduct = async (req, res) => {
  const { name, slug, description, price, mrp, stock, category_id, composition, manufacturer, expiry_date, prescription_required } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const [result] = await db.query(
      `INSERT INTO products (name, slug, description, price, mrp, stock, category_id, composition, manufacturer, expiry_date, prescription_required, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, price, mrp || null, stock, category_id, composition, manufacturer, expiry_date || null, prescription_required ? 1 : 0, image]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug already exists' });
    res.status(500).json({ message: 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, slug, description, price, mrp, stock, category_id, composition, manufacturer, expiry_date, prescription_required, is_active } = req.body;
  const fields = { name, slug, description, price, mrp, stock, category_id, composition, manufacturer, expiry_date, prescription_required, is_active };
  if (req.file) fields.image = `/uploads/${req.file.filename}`;

  const sets = Object.keys(fields).filter(k => fields[k] !== undefined).map(k => `${k} = ?`).join(', ');
  const values = Object.keys(fields).filter(k => fields[k] !== undefined).map(k => fields[k]);

  try {
    await db.query(`UPDATE products SET ${sets} WHERE id = ?`, [...values, req.params.id]);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deactivated' });
  } catch {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

exports.getAllProducts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;
  try {
    const [countResult, dataResult] = await Promise.all([
      db.query('SELECT COUNT(*) as total FROM products'),
      db.query(`SELECT p.*, c.name as category FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, [limit, offset])
    ]);
    const total = countResult[0][0].total;
    const products = dataResult[0];
    res.json({ products, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Orders
exports.getAllOrders = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;
  const { status } = req.query;

  let where = status ? 'WHERE o.status = ?' : '';
  const params = status ? [status] : [];

  try {
    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM orders o ${where}`, params);
    const total = countRows[0].total;
    const [orders] = await db.query(
      `SELECT o.*, u.name as customer, u.email FROM orders o JOIN users u ON o.user_id = u.id ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ orders, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch {
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// Users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, phone, is_verified, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Categories
exports.createCategory = async (req, res) => {
  const { name, slug } = req.body;
  try {
    const [result] = await db.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug exists' });
    res.status(500).json({ message: 'Failed to create category' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [[revenueRow]] = await db.query(`SELECT COALESCE(SUM(total),0) as total FROM orders WHERE status = 'paid'`);
    const [[ordersRow]] = await db.query('SELECT COUNT(*) as total FROM orders');
    const [[usersRow]] = await db.query('SELECT COUNT(*) as total FROM users WHERE role = "user"');
    const [[productsRow]] = await db.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
    const [recentOrders] = await db.query(
      `SELECT o.id, o.total, o.status, o.created_at, u.name as customer
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`
    );
    res.json({ revenue: revenueRow.total, orders: ordersRow.total, users: usersRow.total, products: productsRow.total, recentOrders });
  } catch {
    res.status(500).json({ message: 'Dashboard error' });
  }
};

const db       = require('../models/db');
const path     = require('path');
const fs       = require('fs');
const auditLog = require('../utils/audit');

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
    await auditLog(req, 'CREATE', 'product', result.insertId,
      `Created product: ${name} (₹${price})`,
      null, { name, slug, price, stock }
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

  // Nullable fields — convert empty string to null
  const nullable = ['mrp', 'expiry_date', 'composition', 'manufacturer', 'description'];
  nullable.forEach(k => { if (fields[k] === '') fields[k] = null; });

  const validKeys = Object.keys(fields).filter(k => fields[k] !== undefined);
  if (!validKeys.length) return res.status(400).json({ message: 'No fields to update' });
  const sets   = validKeys.map(k => `${k} = ?`).join(', ');
  const values = validKeys.map(k => fields[k]);

  try {
    // Fetch old values before update
    const [oldRows] = await db.query('SELECT name, price, stock, is_active, composition FROM products WHERE id = ?', [req.params.id]);
    const old = oldRows[0] || null;

    await db.query(`UPDATE products SET ${sets} WHERE id = ?`, [...values, req.params.id]);

    // Build changed fields for audit
    const changes = {};
    if (name      !== undefined && String(name)      !== String(old?.name  || ''))  { changes.name   = { from: old?.name,              to: name              }; }
    if (price     !== undefined && parseFloat(price) !== parseFloat(old?.price))    { changes.price  = { from: `₹${old?.price}`,       to: `₹${price}`       }; }
    if (stock     !== undefined && parseInt(stock)   !== parseInt(old?.stock))      { changes.stock  = { from: `${old?.stock} units`,  to: `${stock} units`  }; }
    if (is_active !== undefined && parseInt(is_active) !== parseInt(old?.is_active)){ changes.status = { from: old?.is_active ? 'Active':'Inactive', to: parseInt(is_active) ? 'Active':'Inactive' }; }

    const changedKeys = Object.keys(changes);
    const productName = old?.name || name || `Product #${req.params.id}`;
    const desc = changedKeys.length
      ? `${productName} — ${changedKeys.map(k => `${k}: ${changes[k].from} → ${changes[k].to}`).join(' | ')}`
      : `${productName} — product details updated`;

    await auditLog(req, 'UPDATE', 'product', req.params.id, desc, old, { name, price, stock, is_active, composition });
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error('[updateProduct]', err.message);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const [[prod]] = await db.query('SELECT name FROM products WHERE id = ?', [req.params.id]);
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    await auditLog(req, 'DELETE', 'product', req.params.id,
      `Deactivated product: ${prod?.name}`,
      { is_active: 1 }, { is_active: 0 }
    );
    res.json({ message: 'Product deactivated' });
  } catch {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

exports.getAllProducts = async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = 20;
  const offset = (page - 1) * limit;
  try {
    const [countResult, dataResult] = await Promise.all([
      db.query('SELECT COUNT(*) as total FROM products'),
      db.query(`SELECT p.*, c.name as category FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, [limit, offset])
    ]);
    res.json({ products: dataResult[0], total: countResult[0][0].total, page, pages: Math.max(1, Math.ceil(countResult[0][0].total / limit)) });
  } catch {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Orders
exports.getAllOrders = async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = 20;
  const offset = (page - 1) * limit;
  const { status } = req.query;
  const where  = status ? 'WHERE o.status = ?' : '';
  const params = status ? [status] : [];
  try {
    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM orders o ${where}`, params);
    const [orders]    = await db.query(
      `SELECT o.*, u.name as customer, u.email FROM orders o JOIN users u ON o.user_id = u.id ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ orders, total: countRows[0].total, page, pages: Math.max(1, Math.ceil(countRows[0].total / limit)) });
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending','paid','processing','shipped','delivered','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const [[order]] = await db.query('SELECT status, id FROM orders WHERE id = ?', [req.params.id]);
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    await auditLog(req, 'STATUS_CHANGE', 'order', req.params.id,
      `Order #${req.params.id} status changed: ${order?.status} → ${status}`,
      { status: order?.status }, { status }
    );
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
    await auditLog(req, 'CREATE', 'category', result.insertId,
      `Created category: ${name}`, null, { name, slug }
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug exists' });
    res.status(500).json({ message: 'Failed to create category' });
  }
};

// Audit Logs
exports.getAuditLogs = async (req, res) => {
  const { action, entity, admin_id, from, to, search, page: pg } = req.query;
  const page   = Math.max(1, parseInt(pg) || 1);
  const limit  = 20;
  const offset = (page - 1) * limit;

  const where  = ['1=1'];
  const params = [];

  if (action)   { where.push('a.action = ?');               params.push(action); }
  if (entity)   { where.push('a.entity = ?');               params.push(entity); }
  if (admin_id) { where.push('a.admin_id = ?');             params.push(admin_id); }
  if (from)     { where.push('a.created_at >= ?');          params.push(from + ' 00:00:00'); }
  if (to)       { where.push('a.created_at <= ?');          params.push(to + ' 23:59:59'); }
  if (search)   { where.push('a.description LIKE ?');       params.push(`%${search}%`); }

  const whereStr = 'WHERE ' + where.join(' AND ');

  try {
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM audit_logs a ${whereStr}`, params);
    const [logs]        = await db.query(
      `SELECT a.*, u.name as admin_name FROM audit_logs a
       LEFT JOIN users u ON a.admin_id = u.id
       ${whereStr} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ logs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [[revenueRow]]  = await db.query(`SELECT COALESCE(SUM(total),0) as total FROM orders WHERE status = 'paid'`);
    const [[ordersRow]]   = await db.query('SELECT COUNT(*) as total FROM orders');
    const [[usersRow]]    = await db.query('SELECT COUNT(*) as total FROM users WHERE role = "user"');
    const [[productsRow]] = await db.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
    const [recentOrders]  = await db.query(
      `SELECT o.id, o.total, o.status, o.created_at, u.name as customer
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`
    );
    res.json({ revenue: revenueRow.total, orders: ordersRow.total, users: usersRow.total, products: productsRow.total, recentOrders });
  } catch {
    res.status(500).json({ message: 'Dashboard error' });
  }
};

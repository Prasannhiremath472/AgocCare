const db = require('../models/db');
const path = require('path');
const fs = require('fs');

// Products
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB as base64 (~2.7MB string, but check original size)
const imageTooLarge = (b64) => b64 && Buffer.byteLength(b64) > MAX_IMAGE_BYTES * 1.4;

exports.createProduct = async (req, res) => {
  const { name, slug, description, price, mrp, stock, category_id, composition, manufacturer, expiry_date, prescription_required, image, meta_title, meta_description, meta_keywords } = req.body;
  if (imageTooLarge(image)) return res.status(400).json({ message: 'Image must be 2 MB or smaller' });
  try {
    const [result] = await db.query(
      `INSERT INTO products (name, slug, description, price, mrp, stock, category_id, composition, manufacturer, expiry_date, prescription_required, image, meta_title, meta_description, meta_keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description || null, price, mrp || null, stock, category_id, composition || null, manufacturer || null, expiry_date || null, prescription_required ? 1 : 0, image || null, meta_title || null, meta_description || null, meta_keywords || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug already exists' });
    res.status(500).json({ message: 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, slug, description, price, mrp, stock, category_id, composition, manufacturer, expiry_date, prescription_required, is_active, image, meta_title, meta_description, meta_keywords } = req.body;
  if (imageTooLarge(image)) return res.status(400).json({ message: 'Image must be 2 MB or smaller' });
  const fields = { name, slug, description, price,
    mrp:                  mrp         === '' ? null : mrp,
    stock,                category_id,
    composition:          composition  === '' ? null : composition,
    manufacturer:         manufacturer === '' ? null : manufacturer,
    expiry_date:          expiry_date  === '' ? null : expiry_date,
    prescription_required, is_active,
    meta_title:           meta_title        === '' ? null : (meta_title        ?? undefined),
    meta_description:     meta_description  === '' ? null : (meta_description  ?? undefined),
    meta_keywords:        meta_keywords     === '' ? null : (meta_keywords     ?? undefined),
  };
  if (image) fields.image = image; // base64 string from frontend

  const keys   = Object.keys(fields).filter(k => fields[k] !== undefined);
  const sets   = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => fields[k]);

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

exports.getOrderDetail = async (req, res) => {
  try {
    const [[order]] = await db.query(
      `SELECT o.*, u.name as customer, u.email, u.phone as customer_phone
       FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query(
      `SELECT oi.qty, oi.price, p.name, p.image, p.slug
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ ...order, items });
  } catch {
    res.status(500).json({ message: 'Failed to fetch order detail' });
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
exports.getAllCategories = async (req, res) => {
  try {
    const [cats] = await db.query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       GROUP BY c.id ORDER BY c.name ASC`
    );
    res.json(cats);
  } catch {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

exports.createCategory = async (req, res) => {
  const { name, slug, image } = req.body;
  if (!name?.trim() || !slug?.trim()) return res.status(400).json({ message: 'Name and slug are required' });
  try {
    const [result] = await db.query('INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)', [name.trim(), slug.trim(), image || null]);
    res.status(201).json({ id: result.insertId, message: 'Category created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug already exists' });
    res.status(500).json({ message: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, slug, image } = req.body;
  if (!name?.trim() || !slug?.trim()) return res.status(400).json({ message: 'Name and slug are required' });
  const fields = ['name = ?', 'slug = ?'];
  const values = [name.trim(), slug.trim()];
  if (image !== undefined) { fields.push('image = ?'); values.push(image || null); }
  try {
    await db.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, [...values, req.params.id]);
    res.json({ message: 'Category updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug already exists' });
    res.status(500).json({ message: 'Failed to update category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM products WHERE category_id = ? AND is_active = 1', [req.params.id]);
    if (cnt > 0) return res.status(409).json({ message: `Cannot delete — ${cnt} active product(s) use this category` });
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

// Product Gallery Images
exports.getProductImages = async (req, res) => {
  try {
    const [images] = await db.query(
      'SELECT id, image_path, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      [req.params.id]
    );
    res.json({ images });
  } catch {
    res.status(500).json({ message: 'Failed to fetch images' });
  }
};

exports.addProductImage = async (req, res) => {
  const { image_path, sort_order } = req.body;
  if (!image_path || !image_path.startsWith('data:image/')) {
    return res.status(400).json({ message: 'Valid base64 image required' });
  }
  try {
    const [[{ maxOrder }]] = await db.query(
      'SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM product_images WHERE product_id = ?',
      [req.params.id]
    );
    const order = sort_order ?? (maxOrder + 1);
    const [result] = await db.query(
      'INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, ?)',
      [req.params.id, image_path, order]
    );
    // Also update main product image if this is the first image
    await db.query(
      'UPDATE products SET image = ? WHERE id = ? AND (image IS NULL OR image = "")',
      [image_path, req.params.id]
    );
    res.status(201).json({ id: result.insertId, message: 'Image added' });
  } catch {
    res.status(500).json({ message: 'Failed to add image' });
  }
};

exports.deleteProductImage = async (req, res) => {
  try {
    await db.query('DELETE FROM product_images WHERE id = ? AND product_id = ?', [req.params.imgId, req.params.id]);
    // If deleted image was the main product image, update it to next available gallery image
    const [[product]] = await db.query('SELECT image FROM products WHERE id = ?', [req.params.id]);
    const [[firstGallery]] = await db.query(
      'SELECT image_path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1',
      [req.params.id]
    );
    if (firstGallery) {
      await db.query('UPDATE products SET image = ? WHERE id = ?', [firstGallery.image_path, req.params.id]);
    }
    res.json({ message: 'Image deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete image' });
  }
};

exports.reorderProductImages = async (req, res) => {
  // req.body.order = [{ id, sort_order }, ...]
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ message: 'order array required' });
  try {
    await Promise.all(order.map(({ id, sort_order }) =>
      db.query('UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?', [sort_order, id, req.params.id])
    ));
    // Update main product image to new first image
    const [[first]] = await db.query(
      'SELECT image_path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1',
      [req.params.id]
    );
    if (first) await db.query('UPDATE products SET image = ? WHERE id = ?', [first.image_path, req.params.id]);
    res.json({ message: 'Images reordered' });
  } catch {
    res.status(500).json({ message: 'Failed to reorder images' });
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

  if (action)   { where.push('a.action = ?');        params.push(action); }
  if (entity)   { where.push('a.entity = ?');        params.push(entity); }
  if (admin_id) { where.push('a.admin_id = ?');      params.push(admin_id); }
  if (from)     { where.push('a.created_at >= ?');   params.push(from + ' 00:00:00'); }
  if (to)       { where.push('a.created_at <= ?');   params.push(to + ' 23:59:59'); }
  if (search)   { where.push('a.description LIKE ?');params.push(`%${search}%`); }

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

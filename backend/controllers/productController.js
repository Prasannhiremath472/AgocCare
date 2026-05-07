const db = require('../models/db');

// Retry helper — retries once on ER_CON_COUNT_ERROR / PROTOCOL_CONNECTION_LOST
const query = async (sql, params) => {
  try {
    return await db.query(sql, params);
  } catch (err) {
    const retryable = ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT', 'ER_CON_COUNT_ERROR'];
    if (retryable.includes(err.code)) {
      console.warn('[DB] Retrying after:', err.code);
      return await db.query(sql, params);
    }
    throw err;
  }
};

exports.getProducts = async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 12);
  const offset = (page - 1) * limit;
  const { category, search, sort } = req.query;

  const where  = ['p.is_active = 1'];
  const params = [];

  if (category) { where.push('c.slug = ?');                              params.push(category); }
  if (search)   { where.push('(p.name LIKE ? OR p.composition LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const whereClause = 'WHERE ' + where.join(' AND ');
  const orderClause =
    sort === 'price_asc'  ? 'ORDER BY p.price ASC'  :
    sort === 'price_desc' ? 'ORDER BY p.price DESC' :
    sort === 'name'       ? 'ORDER BY p.name ASC'   :
                            'ORDER BY p.created_at DESC';

  const countSql = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`;
  const dataSql  = `
    SELECT p.id, p.name, p.slug, p.price, p.mrp, p.stock, p.image,
           p.prescription_required, c.name as category, c.slug as category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause} ${orderClause}
    LIMIT ? OFFSET ?`;

  try {
    const [countResult, dataResult] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, limit, offset]),
    ]);
    const total    = countResult[0][0].total;
    const products = dataResult[0];
    res.json({ products, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    console.error('[getProducts]', err.message);
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const [rows] = await query(
      `SELECT p.*, c.name as category, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = 1`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[getProductBySlug]', err.message);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const [products] = await query(
      `SELECT p.id, p.name, p.slug, p.price, p.mrp, p.image, p.prescription_required,
              c.name as category
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = 1 ORDER BY p.created_at DESC LIMIT 6`
    );
    res.json(products);
  } catch (err) {
    console.error('[getFeatured]', err.message);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

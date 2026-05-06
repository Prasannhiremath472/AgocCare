const router = require('express').Router();
const db = require('../models/db');
const { auth } = require('../middleware/auth');

// Validate cart items and return updated prices/stock (cart lives in localStorage)
router.post('/validate', auth, async (req, res) => {
  const { items } = req.body;
  if (!items?.length) return res.json([]);
  try {
    const ids = items.map(i => i.product_id);
    const [products] = await db.query(
      'SELECT id, name, price, stock, image, is_active FROM products WHERE id IN (?)',
      [ids]
    );
    const map = Object.fromEntries(products.map(p => [p.id, p]));
    const result = items.map(item => ({
      ...item,
      product: map[item.product_id] || null,
      valid: !!(map[item.product_id]?.is_active && map[item.product_id]?.stock >= item.qty)
    }));
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Cart validation failed' });
  }
});

module.exports = router;

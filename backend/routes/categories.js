const router = require('express').Router();
const db = require('../models/db');

router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

module.exports = router;

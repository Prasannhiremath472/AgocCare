const router = require('express').Router();
const db     = require('../models/db');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public — get active offers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM offers WHERE is_active = 1 ORDER BY sort_order ASC');
    res.json(rows);
  } catch { res.status(500).json({ message: 'Failed to fetch offers' }); }
});

// Admin — get all offers
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM offers ORDER BY sort_order ASC');
    res.json(rows);
  } catch { res.status(500).json({ message: 'Failed to fetch offers' }); }
});

// Admin — create offer
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  const { tag, title, subtitle, btn_label, btn_url, bg_gradient, sort_order } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const [r] = await db.query(
      'INSERT INTO offers (tag, title, subtitle, btn_label, btn_url, image, bg_gradient, sort_order) VALUES (?,?,?,?,?,?,?,?)',
      [tag, title, subtitle, btn_label, btn_url, image, bg_gradient || 'from-primary to-secondary', sort_order || 0]
    );
    res.status(201).json({ id: r.insertId, message: 'Offer created' });
  } catch { res.status(500).json({ message: 'Failed to create offer' }); }
});

// Admin — update offer
router.put('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  const { tag, title, subtitle, btn_label, btn_url, bg_gradient, is_active, sort_order } = req.body;
  const fields = { tag, title, subtitle, btn_label, btn_url, bg_gradient, is_active, sort_order };
  if (req.file) fields.image = `/uploads/${req.file.filename}`;
  const sets   = Object.keys(fields).filter(k => fields[k] !== undefined).map(k => `${k} = ?`).join(', ');
  const values = Object.keys(fields).filter(k => fields[k] !== undefined).map(k => fields[k]);
  try {
    await db.query(`UPDATE offers SET ${sets} WHERE id = ?`, [...values, req.params.id]);
    res.json({ message: 'Offer updated' });
  } catch { res.status(500).json({ message: 'Failed to update offer' }); }
});

// Admin — delete offer
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM offers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Offer deleted' });
  } catch { res.status(500).json({ message: 'Failed to delete offer' }); }
});

module.exports = router;

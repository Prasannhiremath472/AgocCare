const db = require('../models/db');

// Public: get all SEO pages (for frontend to cache)
exports.getAllSeo = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM seo_pages ORDER BY page_key ASC');
    // Return as key→data map for easy lookup
    const map = {};
    rows.forEach(r => { map[r.page_key] = r; });
    res.json(map);
  } catch {
    res.status(500).json({ message: 'Failed to fetch SEO data' });
  }
};

// Public: get single page SEO by key
exports.getSeoByKey = async (req, res) => {
  try {
    const [[row]] = await db.query(
      'SELECT * FROM seo_pages WHERE page_key = ?', [req.params.key]
    );
    if (!row) return res.status(404).json({ message: 'SEO page not found' });
    res.json(row);
  } catch {
    res.status(500).json({ message: 'Failed to fetch SEO data' });
  }
};

// Admin: get all SEO pages with all fields
exports.adminGetAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM seo_pages ORDER BY page_key ASC');
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Failed to fetch SEO pages' });
  }
};

// Admin: update SEO for a page
exports.adminUpdate = async (req, res) => {
  const { title, description, keywords, og_title, og_description, og_image, canonical, robots } = req.body;
  try {
    await db.query(
      `UPDATE seo_pages SET
        title = ?, description = ?, keywords = ?,
        og_title = ?, og_description = ?, og_image = ?,
        canonical = ?, robots = ?
       WHERE page_key = ?`,
      [
        title || null, description || null, keywords || null,
        og_title || null, og_description || null, og_image || null,
        canonical || null, robots || 'index,follow',
        req.params.key
      ]
    );
    res.json({ message: 'SEO updated successfully' });
  } catch {
    res.status(500).json({ message: 'Failed to update SEO' });
  }
};

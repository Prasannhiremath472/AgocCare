const router = require('express').Router();
const ctrl   = require('../controllers/seoController');
const { auth, adminOnly } = require('../middleware/auth');

// Public — frontend fetches all SEO at once and caches it
router.get('/',         ctrl.getAllSeo);
router.get('/:key',     ctrl.getSeoByKey);

// Admin — manage SEO per page
router.get('/admin/all',         auth, adminOnly, ctrl.adminGetAll);
router.put('/admin/:key',        auth, adminOnly, ctrl.adminUpdate);

module.exports = router;

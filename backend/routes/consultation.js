const router = require('express').Router();
const ctrl   = require('../controllers/consultationController');
const { auth, adminOnly } = require('../middleware/auth');

// Public — anyone can book a consultation
router.post('/gynecologist', ctrl.bookGynecologist);

// Admin only — view all consultations
router.get('/', auth, adminOnly, ctrl.getAllConsultations);

module.exports = router;

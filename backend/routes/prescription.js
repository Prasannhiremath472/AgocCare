const router  = require('express').Router();
const multer  = require('multer');
const { extractPrescription } = require('../controllers/prescriptionController');
const { auth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/extract', auth, upload.single('prescription'), extractPrescription);

module.exports = router;

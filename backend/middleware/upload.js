const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('[upload] Created uploads dir:', uploadDir);
}
console.log('[upload] Upload dir:', uploadDir, '| writable:', (() => { try { fs.accessSync(uploadDir, fs.constants.W_OK); return true; } catch { return false; } })());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('[upload] Saving to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    console.log('[upload] Filename:', name);
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) console.warn('[upload] Rejected file type:', ext);
  cb(null, allowed.includes(ext));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

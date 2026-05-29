const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// In production on Hostinger:
//   nodejs/ and public_html/ are siblings under the account root
//   Apache can only serve files from public_html/
//   So we save uploads to public_html/uploads/ directly
const isProd     = process.env.NODE_ENV === 'production';
const uploadDir  = isProd
  ? path.join(__dirname, '../../../public_html/uploads')  // Hostinger: nodejs/../public_html/uploads
  : path.join(__dirname, '../uploads');                   // Local dev: backend/uploads

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

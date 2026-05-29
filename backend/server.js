require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
const path    = require('path');

// ── Global crash guards — prevent silent process death ──────────────────────
process.on('uncaughtException', err => {
  console.error('[uncaughtException]', err.message, err.stack);
  // Do NOT exit — keep server alive
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  // Do NOT exit — keep server alive
});

const authRoutes         = require('./routes/auth');
const productRoutes      = require('./routes/products');
const categoryRoutes     = require('./routes/categories');
const cartRoutes         = require('./routes/cart');
const orderRoutes        = require('./routes/orders');
const paymentRoutes      = require('./routes/payment');
const adminRoutes        = require('./routes/admin');
const prescriptionRoutes = require('./routes/prescription');
const analyticsRoutes    = require('./routes/analytics');
const offerRoutes        = require('./routes/offers');
const otpRoutes          = require('./routes/otp');
const consultationRoutes = require('./routes/consultation');

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://agoccarepvtltd.com',
  'https://www.agoccarepvtltd.com',
  'https://palevioletred-buffalo-883797.hostingersite.com',
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
app.use('/api/',      rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20  }));

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/cart',         cartRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/payment',      paymentRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/offers',       offerRoutes);
app.use('/api/otp',          otpRoutes);
app.use('/api/consultation', consultationRoutes);

app.get('/', (req, res) => {
  res.send('AgocCare Backend Running Successfully');
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Upload diagnostic route
const fs = require('fs');
const upload = require('./middleware/upload');
app.get('/api/test-upload', (req, res) => {
  const isProd    = process.env.NODE_ENV === 'production';
  const devDir    = path.join(__dirname, 'uploads');
  const prodDir   = path.join(__dirname, '../../public_html/uploads');
  const activeDir = isProd ? prodDir : devDir;
  const exists    = fs.existsSync(activeDir);
  const writable  = exists ? (() => { try { fs.accessSync(activeDir, fs.constants.W_OK); return true; } catch { return false; } })() : false;
  const files     = exists ? fs.readdirSync(activeDir).slice(0, 20) : [];
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isProd,
    __dirname,
    activeDir,
    exists,
    writable,
    files,
    devDir,
    prodDir,
    prodDirExists: fs.existsSync(prodDir),
  });
});
app.post('/api/test-upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file received' });
  res.json({ message: 'Upload OK', file: req.file.filename, savedTo: req.file.path });
});

// Global Express error handler — catches any thrown errors in routes
app.use((err, req, res, next) => {
  console.error('[Express Error]', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   DB: ${process.env.DB_HOST}/${process.env.DB_NAME}`);
});

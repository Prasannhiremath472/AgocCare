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

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
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

app.get('/', (req, res) => {
  res.send('AgocCare Backend Running Successfully');
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

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

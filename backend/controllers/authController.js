const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../models/db');

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// ── Register (step 2 — after OTP verified on frontend) ──────────────────────
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
];

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, phone } = req.body;
  try {
    const [existing] = await db.query('SELECT id, role FROM users WHERE email = ?', [email]);
    if (existing.length) {
      // Already registered — just return token (re-registration after OTP)
      const user = existing[0];
      await db.query('UPDATE users SET name=?, phone=?, is_verified=1 WHERE id=?', [name, phone || null, user.id]);
      const updated = { id: user.id, email, role: user.role };
      return res.json({ token: signToken(updated), user: { id: user.id, name, email, phone: phone || null, role: user.role } });
    }

    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, is_verified, role) VALUES (?, ?, ?, 1, "user")',
      [name, email, phone || null]
    );
    const user = { id: result.insertId, email, role: 'user' };
    res.status(201).json({ token: signToken(user), user: { id: user.id, name, email, phone: phone || null, role: 'user' } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

// ── Login step 1 — send OTP ──────────────────────────────────────────────────
exports.loginSendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const [rows] = await db.query('SELECT id, name FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(404).json({ message: 'No account found with this email' });

    const { sendOTP } = require('../utils/mailer');
    const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
    const otp = generateOTP();

    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    await db.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [email, otp]
    );
    await sendOTP(email, otp, rows[0].name);

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('[loginSendOTP]', err.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// ── Login step 2 — verify OTP & issue token ──────────────────────────────────
exports.loginVerifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

  try {
    const [otpRows] = await db.query(
      'SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [email, otp]
    );
    if (!otpRows.length) return res.status(400).json({ message: 'Invalid or expired OTP' });

    await db.query('DELETE FROM otps WHERE email = ?', [email]);

    const [users] = await db.query('SELECT id, name, email, phone, role FROM users WHERE email = ?', [email]);
    if (!users.length) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    await db.query('UPDATE users SET is_verified=1 WHERE id=?', [user.id]);

    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  const [rows] = await db.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
};

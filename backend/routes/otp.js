const router = require('express').Router();
const db     = require('../models/db');
const { sendOTP } = require('../utils/mailer');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
router.post('/send', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const otp = generateOTP();

  try {
    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    // Use MySQL NOW() so timezone is consistent with verification query
    await db.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [email, otp]
    );
    await sendOTP(email, otp, name);
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('[OTP send]', err.message);
    res.status(500).json({ message: 'Failed to send OTP. Check email config.' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()',
      [email, otp]
    );
    if (!rows.length) return res.status(400).json({ message: 'Invalid or expired OTP' });

    await db.query('DELETE FROM otps WHERE email = ?', [email]);
    res.json({ message: 'OTP verified', verified: true });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

module.exports = router;

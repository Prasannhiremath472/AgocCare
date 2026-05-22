const db     = require('../models/db');
const mailer = require('../utils/mailer');

exports.bookGynecologist = async (req, res) => {
  const { name, phone, email, age, consultation_type, date, time_slot, message } = req.body;

  // Basic validation
  if (!name || !phone || !age || !consultation_type || !date || !time_slot) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ message: 'Invalid mobile number.' });
  }

  try {
    // Store in DB
    await db.query(
      `INSERT INTO consultations (type, patient_name, phone, email, age, consultation_type, preferred_date, time_slot, message)
       VALUES ('gynecologist', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email || null, age, consultation_type, date, time_slot, message || null]
    );

    // Notify all admins
    const [admins] = await db.query(`SELECT email FROM users WHERE role = 'admin'`);
    const adminEmails = admins.map(a => a.email).filter(Boolean);

    if (adminEmails.length) {
      await mailer.sendConsultationNotification(adminEmails, {
        name, phone, email, age, consultation_type, date, time_slot, message,
        type: 'Gynecologist',
      });
    }

    res.status(201).json({ message: 'Appointment request submitted successfully.' });
  } catch (err) {
    console.error('[Consultation Error]', err.message);
    res.status(500).json({ message: 'Failed to submit. Please try again.' });
  }
};

exports.getAllConsultations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM consultations ORDER BY created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Failed to fetch consultations.' });
  }
};

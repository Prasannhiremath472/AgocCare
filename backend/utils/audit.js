const db = require('../models/db');

const auditLog = async (req, action, entity, entityId, description, oldValue = null, newValue = null) => {
  try {
    const ip         = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const adminId    = req.user?.id    || 0;
    const adminEmail = req.user?.email || 'unknown';
    const oldJson    = oldValue  ? JSON.stringify(oldValue)  : null;
    const newJson    = newValue  ? JSON.stringify(newValue)  : null;
    const entId      = entityId  ? String(entityId)          : null;

    await db.query(
      `INSERT INTO audit_logs
         (admin_id, admin_email, action, entity, entity_id, description, old_value, new_value, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, adminEmail, action, entity, entId, description, oldJson, newJson, ip]
    );
  } catch (err) {
    console.error('[Audit Log Failed]', err.message);
  }
};

module.exports = auditLog;

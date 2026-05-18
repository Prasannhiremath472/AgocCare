const db = require('../models/db');

/**
 * Log an admin action to audit_logs table
 * @param {object} req - Express request (for admin info + IP)
 * @param {string} action - CREATE | UPDATE | DELETE | LOGIN | STATUS_CHANGE | BULK_UPLOAD
 * @param {string} entity - product | order | user | offer | category
 * @param {string|number} entityId - ID of the affected record
 * @param {string} description - Human readable description
 * @param {object} oldValue - Previous state (optional)
 * @param {object} newValue - New state (optional)
 */
const auditLog = async (req, action, entity, entityId, description, oldValue = null, newValue = null) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    await db.query(
      `INSERT INTO audit_logs (admin_id, admin_email, action, entity, entity_id, description, old_value, new_value, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.user.email,
        action,
        entity,
        entityId ? String(entityId) : null,
        description,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ip,
      ]
    );
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = auditLog;

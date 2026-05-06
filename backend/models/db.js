const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:              process.env.DB_HOST,
  user:              process.env.DB_USER,
  password:          process.env.DB_PASSWORD,
  database:          process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  timezone:          '+00:00',
  // Auto-reconnect on connection loss
  enableKeepAlive:   true,
  keepAliveInitialDelay: 10000,
});

// Keep-alive ping every 30 seconds to prevent idle disconnection
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch {
    // Silently ignore — pool will reconnect automatically on next query
  }
}, 30000);

module.exports = pool;

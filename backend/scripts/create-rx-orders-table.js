require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../models/db');
async function main() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS rx_orders (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      user_id      INT,
      name         VARCHAR(150) NOT NULL,
      phone        VARCHAR(20)  NOT NULL,
      email        VARCHAR(150),
      address      TEXT,
      image        LONGTEXT     NOT NULL,
      note         TEXT,
      status       ENUM('pending','processing','completed','rejected') DEFAULT 'pending',
      admin_note   TEXT,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_status (status)
    )
  `);
  console.log('✅ rx_orders table created');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });

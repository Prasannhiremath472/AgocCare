require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../models/db');

async function main() {
  const [orders] = await db.query("SELECT id FROM orders WHERE status = 'pending'");
  if (orders.length === 0) {
    console.log('No pending orders found.');
    process.exit(0);
  }
  const ids = orders.map(o => o.id);
  const [r1] = await db.query('DELETE FROM order_items WHERE order_id IN (?)', [ids]);
  const [r2] = await db.query("DELETE FROM orders WHERE status = 'pending'");
  console.log(`✅ Deleted ${r2.affectedRows} pending orders and ${r1.affectedRows} order items.`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

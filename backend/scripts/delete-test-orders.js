require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../models/db');
const readline = require('readline');

async function main() {
  // Show all pending orders
  const [orders] = await db.query(
    "SELECT id, user_id, total, status, created_at FROM orders WHERE status = 'pending' ORDER BY created_at DESC"
  );

  if (orders.length === 0) {
    console.log('No pending orders found.');
    process.exit(0);
  }

  console.log(`Found ${orders.length} pending orders:\n`);
  orders.forEach(o => console.log(`  ID:${o.id}  Total:₹${o.total}  Created:${o.created_at}`));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(`\nDelete all ${orders.length} pending orders? (yes/no): `, async (ans) => {
    rl.close();
    if (ans.trim().toLowerCase() === 'yes') {
      const ids = orders.map(o => o.id);
      await db.query('DELETE FROM order_items WHERE order_id IN (?)', [ids]);
      await db.query('DELETE FROM orders WHERE id IN (?)', [ids]);
      console.log(`✅ Deleted ${orders.length} pending orders and their items.`);
    } else {
      console.log('Cancelled — no orders deleted.');
    }
    process.exit(0);
  });
}

main().catch(e => { console.error(e); process.exit(1); });

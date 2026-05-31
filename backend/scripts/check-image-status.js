require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../models/db');

async function main() {
  const [[p1]] = await db.query("SELECT COUNT(*) as c FROM products WHERE image IS NULL");
  const [[p2]] = await db.query("SELECT COUNT(*) as c FROM products WHERE image LIKE 'data:image/%'");
  const [[p3]] = await db.query("SELECT COUNT(*) as c FROM products WHERE image NOT LIKE 'data:%' AND image IS NOT NULL");

  const [[g1]] = await db.query("SELECT COUNT(*) as c FROM product_images WHERE image_path IS NULL");
  const [[g2]] = await db.query("SELECT COUNT(*) as c FROM product_images WHERE image_path LIKE 'data:image/%'");
  const [[g3]] = await db.query("SELECT COUNT(*) as c FROM product_images WHERE image_path NOT LIKE 'data:%' AND image_path IS NOT NULL");

  console.log('Products main image:');
  console.log('  NULL (missing):', p1.c);
  console.log('  base64 (good):', p2.c);
  console.log('  file path (needs migration):', p3.c);

  console.log('\nProduct gallery images:');
  console.log('  NULL (missing):', g1.c);
  console.log('  base64 (good):', g2.c);
  console.log('  file path (needs migration):', g3.c);

  // Show file paths still in DB
  const [paths] = await db.query(
    "SELECT id, product_id, image_path FROM product_images WHERE image_path NOT LIKE 'data:%' AND image_path IS NOT NULL LIMIT 5"
  );
  if (paths.length) { console.log('\nSample file paths still in DB:', paths.map(p => p.image_path)); }

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });

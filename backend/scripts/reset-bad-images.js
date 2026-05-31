require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../models/db');

async function main() {
  // Reset any image that is base64-encoded HTML (error pages fetched instead of images)
  // Valid images are data:image/... — invalid ones are data:text/html or tiny (<200 chars)
  const [r1] = await db.query(
    "UPDATE products SET image = NULL WHERE image LIKE 'data:text/%' OR (image LIKE 'data:%' AND LENGTH(image) < 200)"
  );
  console.log('Reset bad product images:', r1.affectedRows);

  const [r2] = await db.query(
    "UPDATE product_images SET image_path = NULL WHERE image_path LIKE 'data:text/%' OR (image_path LIKE 'data:%' AND LENGTH(image_path) < 200)"
  );
  console.log('Reset bad gallery images:', r2.affectedRows);

  // Show what image values look like now
  const [sample] = await db.query('SELECT id, SUBSTRING(image,1,60) as img_preview FROM products WHERE image IS NOT NULL LIMIT 3');
  console.log('\nSample product images after reset:');
  sample.forEach(r => console.log(' ', r.id, r.img_preview));

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });

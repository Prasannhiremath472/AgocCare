/**
 * Migrates the main `image` column of products table.
 * Since we reset them to NULL, we re-fetch from production using product name patterns
 * stored in product_images (gallery) which still has the paths we can derive the base URL from.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db    = require('../models/db');
const https = require('https');

const PRODUCTION_BASE = 'https://agoccarepvtltd.com';

function fetchRemoteBase64(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchRemoteBase64(res.headers.location).then(resolve);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf  = Buffer.concat(chunks);
        const ct   = res.headers['content-type'] || '';
        if (!ct.startsWith('image/')) { resolve(null); return; }
        const mime = ct.split(';')[0].trim();
        resolve(`data:${mime};base64,${buf.toString('base64')}`);
      });
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

async function main() {
  console.log('🚀 Migrating product main images...\n');

  // Get all products that have NULL image but have gallery images we can derive URL from
  const [products] = await db.query(
    `SELECT p.id, p.name, pi.image_path as gallery_path
     FROM products p
     JOIN product_images pi ON pi.product_id = p.id
     WHERE p.image IS NULL
     GROUP BY p.id
     ORDER BY p.id`
  );

  console.log(`Found ${products.length} products with NULL main image\n`);

  let updated = 0, failed = 0;

  for (const row of products) {
    process.stdout.write(`[${row.id}] ${row.name.substring(0, 40).padEnd(40)} → `);

    // The gallery image_path is already base64 now — we can use it as the main image too
    // Just fetch the first gallery image's original URL by deriving it from DB path pattern
    // OR we use the already-stored base64 gallery image directly as the main image
    const [[firstGallery]] = await db.query(
      'SELECT image_path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1',
      [row.id]
    );

    if (firstGallery && firstGallery.image_path && firstGallery.image_path.startsWith('data:image/')) {
      // Use the first gallery base64 image as the main product image
      await db.query('UPDATE products SET image = ? WHERE id = ?', [firstGallery.image_path, row.id]);
      process.stdout.write(`✅ copied from gallery (${Math.round(firstGallery.image_path.length / 1024)}KB)\n`);
      updated++;
    } else {
      process.stdout.write(`❌ no valid gallery image found\n`);
      failed++;
    }
  }

  // Also handle products that have no gallery images at all — fetch directly
  const [noGallery] = await db.query(
    `SELECT id, name FROM products WHERE image IS NULL
     AND id NOT IN (SELECT DISTINCT product_id FROM product_images)`
  );

  if (noGallery.length > 0) {
    console.log(`\n📦 ${noGallery.length} products have no gallery images — skipping (no source URL available)`);
  }

  console.log(`\n✅ Done: ${updated} updated, ${failed} failed`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

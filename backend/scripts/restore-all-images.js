/**
 * Restores all NULL product images by fetching from production server.
 * Uses the known URL pattern: /uploads/ProductName/N.jpg
 * Product name → URL mapping derived from the original migration log.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db    = require('../models/db');
const https = require('https');

const PRODUCTION_BASE = 'https://agoccarepvtltd.com';

// Known folder names from the original DB paths (before they were reset)
// Format: productId → folderName (URL-decoded)
const PRODUCT_FOLDERS = {
  34: '1T FOL MD Tab',
  35: '5T FOL MD Tab',
  36: 'AFC Boost',
  37: 'Agerich',
  38: 'Box10',
  39: 'Box11',
  40: 'Box12',
  41: 'Box13',
  42: 'Box14',
  43: 'Box15',
  44: 'Box16',
  45: 'Box17',
  46: 'Box18',
  47: 'Box19',
  48: 'Box20',
  49: 'Box5',
  50: 'Box6',
  51: 'Box7',
  52: 'Box8',
  53: 'Box9',
  54: 'Dienogest Tablets',
  55: 'Endohope AQ 50mg',
  56: 'Folok DHA',
  57: 'H PRO DEPOT 500 INJECTION',
  58: 'melatonin & vitamin d3 tablets',
  59: 'Mito Q tablets',
};

// Known extensions per folder (from migration log)
const FOLDER_EXT = {
  34: 'jpg', 35: 'jpg', 36: 'jpg', 37: 'jpg',
  38: 'jpg', 39: 'jpg', 40: 'jpg', 41: 'jpg',
  42: 'jpg', 43: 'jpg', 44: 'jpg', 45: 'jpg',
  46: 'jpg', 47: 'jpg', 48: 'jpg', 49: 'jpg',
  50: 'jpg', 51: 'jpg', 52: 'jpg', 53: 'jpg',
  54: 'jpg', 55: 'png', 56: 'png', 57: 'png',
  58: 'jpg', 59: 'jpg',
};

function fetchRemoteBase64(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchRemoteBase64(res.headers.location).then(resolve);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const ct = res.headers['content-type'] || '';
        if (!ct.startsWith('image/')) { resolve(null); return; }
        const buf  = Buffer.concat(chunks);
        const mime = ct.split(';')[0].trim();
        resolve(`data:${mime};base64,${buf.toString('base64')}`);
      });
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

function buildUrl(folder, index, ext) {
  const encoded = encodeURIComponent(folder);
  return `${PRODUCTION_BASE}/uploads/${encoded}/${index}.${ext}`;
}

async function main() {
  console.log('🚀 Restoring all NULL images from production server...\n');

  // Get all products with NULL images that we have folder mappings for
  const [products] = await db.query(
    `SELECT p.id, p.name, COUNT(pi.id) as slot_count
     FROM products p
     LEFT JOIN product_images pi ON pi.product_id = p.id
     WHERE p.image IS NULL
     GROUP BY p.id ORDER BY p.id`
  );

  let totalUpdated = 0;

  for (const product of products) {
    const folder = PRODUCT_FOLDERS[product.id];
    const ext    = FOLDER_EXT[product.id] || 'jpg';
    if (!folder) { console.log(`[${product.id}] ${product.name} — no folder mapping, skipping`); continue; }

    console.log(`\n[${product.id}] ${product.name} (${product.slot_count} images, folder: ${folder})`);

    // Fetch all gallery images
    const [galleryRows] = await db.query(
      'SELECT id FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      [product.id]
    );

    let firstBase64 = null;
    for (let i = 0; i < galleryRows.length; i++) {
      const imageIndex = i + 1;
      const url = buildUrl(folder, imageIndex, ext);
      process.stdout.write(`  img ${imageIndex}: `);
      const b64 = await fetchRemoteBase64(url);
      if (b64) {
        await db.query('UPDATE product_images SET image_path = ? WHERE id = ?', [b64, galleryRows[i].id]);
        process.stdout.write(`✅ ${Math.round(b64.length / 1024)}KB\n`);
        if (!firstBase64) firstBase64 = b64;
        totalUpdated++;
      } else {
        // Try alternative extension
        const altExt = ext === 'jpg' ? 'png' : 'jpg';
        const altUrl = buildUrl(folder, imageIndex, altExt);
        const b64Alt = await fetchRemoteBase64(altUrl);
        if (b64Alt) {
          await db.query('UPDATE product_images SET image_path = ? WHERE id = ?', [b64Alt, galleryRows[i].id]);
          process.stdout.write(`✅ ${Math.round(b64Alt.length / 1024)}KB (${altExt})\n`);
          if (!firstBase64) firstBase64 = b64Alt;
          totalUpdated++;
        } else {
          process.stdout.write(`❌ not found\n`);
        }
      }
    }

    // Set main product image = first gallery image
    if (firstBase64) {
      await db.query('UPDATE products SET image = ? WHERE id = ?', [firstBase64, product.id]);
      console.log(`  ✅ Main image set (${Math.round(firstBase64.length / 1024)}KB)`);
    }
  }

  console.log(`\n✅ Done! ${totalUpdated} gallery images restored.`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

/**
 * One-time migration script: convert all product & category images
 * from file paths (uploads/xxx.jpg) to base64 data URIs stored in DB.
 *
 * Run from backend folder:
 *   node scripts/migrate-images-to-base64.js
 *
 * Safe to re-run — skips images already stored as base64 or HTTP URLs.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const db   = require('../models/db');
const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const isProd    = process.env.NODE_ENV === 'production';
const uploadDir = isProd
  ? path.join(__dirname, '../../../public_html/uploads')
  : path.join(__dirname, '../uploads');

// MIME type map
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };

// ── Helpers ───────────────────────────────────────────────────────────────────

function localPathToBase64(filePath) {
  // filePath could be "uploads/abc.jpg" or "/uploads/abc.jpg" or just a filename
  const clean = filePath.replace(/^\//, ''); // strip leading slash
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(uploadDir, path.basename(clean)); // always look in uploadDir

  if (!fs.existsSync(fullPath)) return null; // will fall through to remote fetch

  const ext  = path.extname(fullPath).toLowerCase();
  const mime = MIME[ext] || 'image/jpeg';
  const buf  = fs.readFileSync(fullPath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function fetchRemoteBase64(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf  = Buffer.concat(chunks);
        const ct   = res.headers['content-type'] || 'image/jpeg';
        const mime = ct.split(';')[0].trim();
        resolve(`data:${mime};base64,${buf.toString('base64')}`);
      });
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

const PRODUCTION_BASE = 'https://agoccarepvtltd.com';

async function toBase64(imagePath) {
  if (!imagePath) return null;
  // Already base64
  if (imagePath.startsWith('data:')) return imagePath;
  // Already a full remote URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return await fetchRemoteBase64(imagePath);
  }
  // Relative path like /uploads/Box5/1.jpg — try local first, then production server
  const localB64 = localPathToBase64(imagePath);
  if (localB64) return localB64;

  // Not found locally → fetch from production server
  // Decode any percent-encoding first (e.g. %20 → space), then re-encode properly
  const decoded = decodeURIComponent(imagePath);
  const clean   = decoded.startsWith('/') ? decoded : `/${decoded}`;
  // Re-encode each path segment (handles spaces, &, etc.)
  const encoded = clean.split('/').map(seg => encodeURIComponent(seg)).join('/');
  const url     = `${PRODUCTION_BASE}${encoded}`;
  return await fetchRemoteBase64(url);
}

// ── Products ──────────────────────────────────────────────────────────────────

async function migrateProducts() {
  console.log('\n📦 Migrating product images...');
  const [rows] = await db.query(
    `SELECT id, name, image FROM products WHERE image IS NOT NULL AND image != '' ORDER BY id`
  );

  console.log(`   Found ${rows.length} products with images`);
  let updated = 0, skipped = 0, failed = 0;

  for (const row of rows) {
    if (row.image.startsWith('data:')) {
      skipped++;
      continue; // already base64
    }
    process.stdout.write(`   [${row.id}] ${row.name.substring(0, 40).padEnd(40)} → `);
    const b64 = await toBase64(row.image);
    if (b64) {
      await db.query('UPDATE products SET image = ? WHERE id = ?', [b64, row.id]);
      process.stdout.write(`✅ ${Math.round(b64.length / 1024)}KB\n`);
      updated++;
    } else {
      process.stdout.write(`❌ failed\n`);
      failed++;
    }
  }

  console.log(`   Products: ${updated} updated, ${skipped} already base64, ${failed} failed`);
}

// ── Product gallery images ────────────────────────────────────────────────────

async function migrateProductImages() {
  console.log('\n🖼  Migrating product gallery images...');
  const [rows] = await db.query(
    `SELECT id, product_id, image_path FROM product_images WHERE image_path IS NOT NULL ORDER BY id`
  );

  console.log(`   Found ${rows.length} gallery images`);
  let updated = 0, skipped = 0, failed = 0;

  for (const row of rows) {
    if (row.image_path.startsWith('data:')) { skipped++; continue; }
    process.stdout.write(`   [img ${row.id} / product ${row.product_id}] → `);
    const b64 = await toBase64(row.image_path);
    if (b64) {
      await db.query('UPDATE product_images SET image_path = ? WHERE id = ?', [b64, row.id]);
      process.stdout.write(`✅ ${Math.round(b64.length / 1024)}KB\n`);
      updated++;
    } else {
      process.stdout.write(`❌ failed\n`);
      failed++;
    }
  }

  console.log(`   Gallery: ${updated} updated, ${skipped} already base64, ${failed} failed`);
}

// ── Categories ────────────────────────────────────────────────────────────────

async function migrateCategories() {
  console.log('\n📁 Migrating category images...');
  const [rows] = await db.query(
    `SELECT id, name, image FROM categories WHERE image IS NOT NULL AND image != '' ORDER BY id`
  );

  console.log(`   Found ${rows.length} categories with images`);
  let updated = 0, skipped = 0, failed = 0;

  for (const row of rows) {
    if (row.image.startsWith('data:')) { skipped++; continue; }
    process.stdout.write(`   [${row.id}] ${row.name.padEnd(30)} → `);
    const b64 = await toBase64(row.image);
    if (b64) {
      await db.query('UPDATE categories SET image = ? WHERE id = ?', [b64, row.id]);
      process.stdout.write(`✅ ${Math.round(b64.length / 1024)}KB\n`);
      updated++;
    } else {
      process.stdout.write(`❌ failed\n`);
      failed++;
    }
  }

  console.log(`   Categories: ${updated} updated, ${skipped} already base64, ${failed} failed`);
}

// ── Fix column types ──────────────────────────────────────────────────────────

async function fixColumnTypes() {
  console.log('\n🔧 Ensuring image columns are LONGTEXT...');
  await db.query('ALTER TABLE products MODIFY COLUMN image LONGTEXT');
  await db.query('ALTER TABLE product_images MODIFY COLUMN image_path LONGTEXT');
  await db.query('ALTER TABLE categories MODIFY COLUMN image LONGTEXT');
  console.log('   ✅ Column types updated');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting image → base64 migration');
  console.log(`   Upload dir: ${uploadDir}`);
  console.log(`   DB: ${process.env.DB_HOST}/${process.env.DB_NAME}`);

  try {
    await fixColumnTypes();
    await migrateProducts();
    await migrateProductImages();
    await migrateCategories();
    console.log('\n✅ Migration complete! All images are now stored as base64.');
  } catch (err) {
    console.error('\n❌ Migration error:', err);
  } finally {
    process.exit(0);
  }
}

main();

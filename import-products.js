require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const mysql = require('./backend/node_modules/mysql2/promise');
const fs    = require('fs');
const path  = require('path');

// ── Map folder name → product data ───────────────────────────────────────────
// Box folders: tell me what these are and I'll fill them in
// For now I'll use the folder name as product name and auto-generate slug
const PRODUCT_MAP = {
  '1T FOL MD Tab':                 { name: '1T FOL MD Tab',                 category: 'Tablets',   price: 350, mrp: 420, composition: 'Folate, Methylcobalamin, Vitamin D3' },
  '5T FOL MD Tab':                 { name: '5T FOL MD Tab',                 category: 'Tablets',   price: 550, mrp: 650, composition: 'Folate 5mg, Methylcobalamin, Vitamin D3' },
  'AFC Boost':                     { name: 'AFC Boost',                     category: 'Vitamins',  price: 480, mrp: 580, composition: 'Multivitamin, Antioxidant Complex' },
  'Agerich':                       { name: 'Agerich',                       category: 'Vitamins',  price: 620, mrp: 750, composition: 'Anti-aging Nutrients, Coenzyme Q10' },
  'Dienogest Tablets':             { name: 'Dienogest Tablets',             category: 'Tablets',   price: 890, mrp: 1050, composition: 'Dienogest 2mg', rx: true },
  'Endohope AQ 50mg':              { name: 'Endohope AQ 50mg',              category: 'Injections',price: 1200, mrp: 1450, composition: 'Hydroxyprogesterone 50mg', rx: true },
  'Folok DHA':                     { name: 'Folok DHA',                     category: 'Capsules',  price: 420, mrp: 500, composition: 'Folic Acid, DHA, Omega-3' },
  'H PRO DEPOT 500 INJECTION':     { name: 'H Pro Depot 500 Injection',     category: 'Injections',price: 1800, mrp: 2100, composition: 'Hydroxyprogesterone Caproate 500mg', rx: true },
  'melatonin & vitamin d3 tablets':{ name: 'Melatonin & Vitamin D3 Tablets',category: 'Tablets',   price: 320, mrp: 400, composition: 'Melatonin 5mg, Vitamin D3 1000IU' },
  'Mito Q tablets':                { name: 'Mito Q Tablets',                category: 'Tablets',   price: 750, mrp: 900, composition: 'MitoQ, Coenzyme Q10' },
  'Pregin PCO':                    { name: 'Pregin PCO',                    category: 'Capsules',  price: 560, mrp: 680, composition: 'Myo-Inositol, D-Chiro Inositol, Folic Acid' },
  'Sodium Injection IP':           { name: 'Sodium Chloride Injection IP',  category: 'Injections',price: 85,  mrp: 110, composition: 'Sodium Chloride 0.9% w/v', rx: true },
  'Soft Gelatin Capsules 400mg':   { name: 'Soft Gelatin Capsules 400mg',   category: 'Capsules',  price: 280, mrp: 350, composition: 'Vitamin E 400mg' },
  'Tadalafil Tablets IP 5mg':      { name: 'Tadalafil Tablets IP 5mg',      category: 'Tablets',   price: 450, mrp: 550, composition: 'Tadalafil 5mg', rx: true },
  // Box products — fill these in when you know what they are
  'Box5':  { name: 'Box5 Product',  category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box6':  { name: 'Box6 Product',  category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box7':  { name: 'Box7 Product',  category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box8':  { name: 'Box8 Product',  category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box9':  { name: 'Box9 Product',  category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box10': { name: 'Box10 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box11': { name: 'Box11 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box12': { name: 'Box12 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box13': { name: 'Box13 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box14': { name: 'Box14 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box15': { name: 'Box15 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box16': { name: 'Box16 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box17': { name: 'Box17 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box18': { name: 'Box18 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box19': { name: 'Box19 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
  'Box20': { name: 'Box20 Product', category: 'Tablets', price: 300, mrp: 380, composition: 'Unknown' },
};

const slugify = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const publicDir = path.join(__dirname, 'frontend', 'public');

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });

  // Get category IDs
  const [cats] = await pool.query('SELECT id, name FROM categories');
  const catMap = Object.fromEntries(cats.map(c => [c.name, c.id]));

  const folders = fs.readdirSync(publicDir).filter(f =>
    fs.statSync(path.join(publicDir, f)).isDirectory()
  );

  for (const folder of folders) {
    const meta = PRODUCT_MAP[folder];
    if (!meta) { console.log(`⚠️  No mapping for folder: ${folder}`); continue; }

    const slug     = slugify(meta.name);
    const catId    = catMap[meta.category];
    const images   = fs.readdirSync(path.join(publicDir, folder))
                       .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
                       .sort((a, b) => parseInt(a) - parseInt(b));

    if (!images.length) { console.log(`⚠️  No images in: ${folder}`); continue; }

    const firstImage = `/products/${encodeURIComponent(folder)}/${images[0]}`;

    // Upsert product
    const [existing] = await pool.query('SELECT id FROM products WHERE slug = ?', [slug]);
    let productId;

    if (existing.length) {
      productId = existing[0].id;
      await pool.query(
        'UPDATE products SET name=?, price=?, mrp=?, stock=100, category_id=?, composition=?, prescription_required=?, image=?, is_active=1 WHERE id=?',
        [meta.name, meta.price, meta.mrp, catId, meta.composition, meta.rx ? 1 : 0, firstImage, productId]
      );
      console.log(`✏️  Updated: ${meta.name}`);
    } else {
      const [res] = await pool.query(
        'INSERT INTO products (name, slug, price, mrp, stock, category_id, composition, prescription_required, image, is_active) VALUES (?,?,?,?,100,?,?,?,?,1)',
        [meta.name, slug, meta.price, meta.mrp, catId, meta.composition, meta.rx ? 1 : 0, firstImage]
      );
      productId = res.insertId;
      console.log(`✅  Inserted: ${meta.name} (id=${productId})`);
    }

    // Clear old images then insert all
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
    for (let i = 0; i < images.length; i++) {
      const imgPath = `/products/${encodeURIComponent(folder)}/${images[i]}`;
      await pool.query(
        'INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, ?)',
        [productId, imgPath, i]
      );
    }
    console.log(`   📸 ${images.length} images linked for ${meta.name}`);
  }

  console.log('\n✅ Import complete!');
  process.exit();
}

run().catch(e => { console.error(e.message); process.exit(1); });

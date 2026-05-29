const XLSX     = require('xlsx');
const AdmZip   = require('adm-zip');
const path     = require('path');
const fs       = require('fs');
const db       = require('../models/db');
const auditLog = require('../utils/audit');

const isProd     = process.env.NODE_ENV === 'production';
const UPLOAD_DIR = isProd
  ? path.join(__dirname, '../../../public_html/uploads')  // Hostinger: controllers/../backend/../nodejs/../public_html/uploads
  : path.join(__dirname, '../uploads');

const slugify = str => str.toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const CATEGORY_MAP = {
  tablets: 1, tablet: 1,
  syrups: 2, syrup: 2,
  capsules: 3, capsule: 3,
  injections: 4, injection: 4,
  vitamins: 5, vitamin: 5,
};

exports.bulkUpload = async (req, res) => {
  const excelFile = req.files?.excel?.[0];
  const zipFile   = req.files?.images?.[0];

  if (!excelFile) return res.status(400).json({ message: 'Excel file is required' });

  const results = { success: [], failed: [], total: 0 };

  // Parse Excel
  let rows = [];
  try {
    const wb = XLSX.read(excelFile.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows     = XLSX.utils.sheet_to_json(ws, { defval: '' });
  } catch (e) {
    return res.status(400).json({ message: 'Invalid Excel file: ' + e.message });
  }

  if (!rows.length) return res.status(400).json({ message: 'Excel file is empty' });
  results.total = rows.length;

  // Extract ZIP images into map: slug → [{ name, ext, buffer }]
  const imageMap = {};
  if (zipFile) {
    try {
      const zip = new AdmZip(zipFile.buffer);
      zip.getEntries().forEach(entry => {
        if (entry.isDirectory) return;
        const name = path.basename(entry.entryName);
        const ext  = path.extname(name).toLowerCase();
        if (!['.jpg','.jpeg','.png','.webp'].includes(ext)) return;
        const base = path.basename(name, ext).replace(/-\d+$/, '');
        const slug = slugify(base);
        if (!imageMap[slug]) imageMap[slug] = [];
        imageMap[slug].push({ name, ext, buffer: entry.getData() });
      });
    } catch (e) {
      console.warn('[BulkUpload] ZIP parse error:', e.message);
    }
  }

  // Process each row
  for (const row of rows) {
    const name = String(row['name'] || row['Product Name'] || '').trim();
    if (!name) { results.failed.push({ name: '(empty)', reason: 'Name is required' }); continue; }

    try {
      const slug        = slugify(row['slug'] || row['Slug (URL)'] || name);
      const catRaw      = String(row['category'] || row['Category'] || '').toLowerCase().trim();
      const category_id = CATEGORY_MAP[catRaw] || 1;
      const price       = parseFloat(row['price'] || row['Selling Price ₹'] || 0);
      const mrp         = parseFloat(row['mrp'] || row['MRP ₹'] || 0) || null;
      const stock       = parseInt(row['stock'] || row['Stock Qty'] || 0);
      const composition = String(row['composition'] || row['Composition / Salt'] || '').trim() || null;
      const rx          = String(row['prescription'] || row['Prescription (Yes/No)'] || 'no').toLowerCase() === 'yes' ? 1 : 0;
      const description = String(row['description'] || row['Description'] || '').trim() || null;
      const manufacturer= String(row['manufacturer'] || row['Brand / Manufacturer'] || '').trim() || null;
      const expiryRaw   = String(row['expiry'] || row['Expiry Date (MM/YYYY)'] || '').trim();

      let expiry_date = null;
      if (expiryRaw) {
        const [mm, yyyy] = expiryRaw.split('/');
        if (mm && yyyy) expiry_date = `${yyyy}-${mm.padStart(2,'0')}-01`;
      }

      if (price < 1) { results.failed.push({ name, reason: 'Price must be >= 1' }); continue; }

      // Save images
      let firstImage = null;
      const productImages = imageMap[slug] || imageMap[slugify(name)] || [];
      const productDir    = path.join(UPLOAD_DIR, slug);

      if (productImages.length) {
        if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true });
        productImages.forEach((img, idx) => {
          fs.writeFileSync(path.join(productDir, `${idx + 1}${img.ext}`), img.buffer);
          if (idx === 0) firstImage = `/uploads/${slug}/1${img.ext}`;
        });
      }

      // Upsert product
      const [existing] = await db.query('SELECT id FROM products WHERE slug = ?', [slug]);
      let productId;

      if (existing.length) {
        productId = existing[0].id;
        await db.query(
          `UPDATE products SET name=?,price=?,mrp=?,stock=?,category_id=?,composition=?,
           prescription_required=?,description=?,manufacturer=?,expiry_date=?,is_active=1
           ${firstImage ? ',image=?' : ''} WHERE id=?`,
          firstImage
            ? [name,price,mrp,stock,category_id,composition,rx,description,manufacturer,expiry_date,firstImage,productId]
            : [name,price,mrp,stock,category_id,composition,rx,description,manufacturer,expiry_date,productId]
        );
      } else {
        const [r] = await db.query(
          `INSERT INTO products (name,slug,price,mrp,stock,category_id,composition,
           prescription_required,description,manufacturer,expiry_date,image,is_active)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)`,
          [name,slug,price,mrp,stock,category_id,composition,rx,description,manufacturer,expiry_date,firstImage]
        );
        productId = r.insertId;
      }

      // Link images in product_images table
      if (productImages.length) {
        await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
        for (let i = 0; i < productImages.length; i++) {
          await db.query(
            'INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?,?,?)',
            [productId, `/uploads/${slug}/${i+1}${productImages[i].ext}`, i]
          );
        }
      }

      results.success.push({ name, slug, productId, images: productImages.length });
    } catch (err) {
      results.failed.push({ name, reason: err.message });
    }
  }

  // Audit log
  if (req.user) {
    await auditLog(req, 'BULK_UPLOAD', 'product', null,
      `Bulk upload: ${results.success.length} succeeded, ${results.failed.length} failed out of ${results.total} rows`,
      null, { success: results.success.length, failed: results.failed.length, total: results.total }
    );
  }

  res.json({
    message: `Bulk upload complete: ${results.success.length} succeeded, ${results.failed.length} failed`,
    ...results
  });
};

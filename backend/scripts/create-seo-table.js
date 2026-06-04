require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../models/db');

async function main() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS seo_pages (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      page_key    VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g. home, about, products, product_detail',
      page_label  VARCHAR(150) NOT NULL COMMENT 'Human readable name shown in admin',
      title       VARCHAR(255),
      description TEXT,
      keywords    VARCHAR(500),
      og_title    VARCHAR(255),
      og_description TEXT,
      og_image    VARCHAR(500),
      canonical   VARCHAR(500),
      robots      VARCHAR(100) DEFAULT 'index,follow',
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ seo_pages table created');

  // Seed default pages
  const pages = [
    { key: 'home',           label: 'Home Page',            title: 'AgocCare – Buy Medicines Online | Fast Delivery Across India',   description: 'Order genuine medicines, healthcare products & vitamins online at best prices. Free delivery on orders above ₹499. Agoc Care Pvt Ltd.', keywords: 'buy medicines online, online pharmacy india, agoc care, generic medicines, healthcare products' },
    { key: 'products',       label: 'Medicines / Products',  title: 'Buy Medicines Online – AgocCare',                                description: 'Browse 1000+ genuine medicines, vitamins, supplements & healthcare products at discounted prices. Fast delivery.',                      keywords: 'medicines online, buy tablets, capsules, syrups, healthcare products india' },
    { key: 'product_detail', label: 'Product Detail Page',   title: null,                                                             description: null,                                                                                                                           keywords: 'medicine, tablet, capsule, buy online, genuine' },
    { key: 'about',          label: 'About Us',              title: 'About AgocCare – Licensed Pharma Wholesale & Retail | Kolhapur', description: 'Agoc Care Pvt Ltd – Licensed pharmaceutical company offering wholesale, retail & online medicine delivery since 2016.',             keywords: 'agoc care, about us, pharma company kolhapur, licensed pharmacy' },
    { key: 'cart',           label: 'Cart Page',             title: 'Your Cart – AgocCare',                                           description: 'Review your medicines and healthcare products before checkout.',                                                                 keywords: '' },
    { key: 'checkout',       label: 'Checkout Page',         title: 'Checkout – AgocCare',                                            description: 'Secure checkout for your medicine orders. Pay via Razorpay.',                                                                   keywords: '' },
    { key: 'orders',         label: 'My Orders',             title: 'My Orders – AgocCare',                                           description: 'Track your medicine orders and view order history.',                                                                           keywords: '' },
    { key: 'login',          label: 'Login Page',            title: 'Sign In – AgocCare',                                             description: 'Sign in to your AgocCare account to order medicines online.',                                                                  keywords: '' },
    { key: 'register',       label: 'Register Page',         title: 'Create Account – AgocCare',                                      description: 'Register with AgocCare to buy genuine medicines online and enjoy fast delivery.',                                                keywords: '' },
    { key: 'prescription',   label: 'Prescription Upload',   title: 'Upload Prescription – AgocCare AI Scanner',                      description: 'Upload your prescription and let our AI instantly identify medicines and find matching products.',                               keywords: 'upload prescription, prescription scanner, buy prescription medicines online' },
  ];

  for (const p of pages) {
    await db.query(
      `INSERT INTO seo_pages (page_key, page_label, title, description, keywords)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE page_label = VALUES(page_label)`,
      [p.key, p.label, p.title || null, p.description || null, p.keywords || null]
    );
    console.log(`  ✅ ${p.label}`);
  }

  console.log('\n✅ SEO pages seeded successfully!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

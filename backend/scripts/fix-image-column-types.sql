-- Run this SQL on your database BEFORE running the migration script.
-- Changes image columns to LONGTEXT to hold base64 strings (up to ~4GB).

ALTER TABLE products MODIFY COLUMN image LONGTEXT;
ALTER TABLE product_images MODIFY COLUMN image_path LONGTEXT;
ALTER TABLE categories MODIFY COLUMN image LONGTEXT;

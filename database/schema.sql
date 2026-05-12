-- Medico E-Commerce Database Schema
-- MySQL 8.0+ optimized for shared hosting


CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  image VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  category_id INT UNSIGNED NOT NULL,
  composition VARCHAR(500),
  manufacturer VARCHAR(200),
  expiry_date DATE,
  prescription_required TINYINT(1) NOT NULL DEFAULT 0,
  image VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_active_category (is_active, category_id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  qty INT UNSIGNED NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL UNIQUE,
  payment_id VARCHAR(100) NOT NULL,
  signature VARCHAR(500) NOT NULL,
  status ENUM('success','failed') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed: default admin user (password: Admin@123 bcrypt hashed)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@medico.com', '$2b$10$LLxLVQ1jj.ZjvUWmtZQ21O.na5oFM5Rvxl9ziEpLGMXt9snStQCc2', 'admin');

-- Seed: categories
INSERT INTO categories (name, slug) VALUES
('Tablets', 'tablets'),
('Syrups', 'syrups'),
('Capsules', 'capsules'),
('Injections', 'injections'),
('Vitamins', 'vitamins'),
('Skincare', 'skincare'),
('Medical Devices', 'medical-devices');

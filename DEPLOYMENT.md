# Medico — Hostinger Deployment Guide

## Prerequisites
- Hostinger Business/Cloud plan (Node.js support + MySQL)
- Domain connected to Hostinger
- SSH access enabled

---

## 1. MySQL Setup (hPanel)

1. Go to **Databases → MySQL Databases**
2. Create database: `medico_db`
3. Create user + assign all privileges
4. Open **phpMyAdmin** → import `database/schema.sql`

---

## 2. Backend Deployment

### Upload files
```bash
# Locally — install dependencies
cd backend
npm install --omit=dev

# Zip the backend folder (exclude node_modules if uploading via FTP)
# Upload via hPanel File Manager or FTP to: /home/username/medico-backend/
```

### Environment variables
Create `/home/username/medico-backend/.env`:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=medico_db
JWT_SECRET=replace_with_32+_random_chars
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### Start with PM2 (Hostinger Node.js)
```bash
# Via SSH
cd /home/username/medico-backend
npm install pm2 -g
pm2 start server.js --name medico-api
pm2 save
pm2 startup
```

### Point subdomain to backend
In hPanel → **Subdomains**: create `api.yourdomain.com` → proxy to port 5000
Or use `.htaccess` reverse proxy if on shared hosting:
```apache
# /home/username/api.yourdomain.com/public_html/.htaccess
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
```

---

## 3. Frontend Deployment

### Build
```bash
cd frontend
cp .env.example .env
# Edit .env:
# VITE_API_URL=https://api.yourdomain.com/api

npm install
npm run build
# Output: frontend/dist/
```

### Upload
Upload everything inside `frontend/dist/` to your domain's public root:
`/home/username/public_html/` (or the domain's document root in hPanel)

### SPA routing fix — `.htaccess`
Create `/home/username/public_html/.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

---

## 4. Performance Checklist

- [ ] Enable **Hostinger LiteSpeed Cache** (hPanel → Speed → Cache)  
- [ ] Enable **GZIP compression** (LiteSpeed handles this automatically)  
- [ ] Set **Cloudflare** in front (free CDN + DDoS protection)  
- [ ] Enable **SSL** in hPanel → SSL  
- [ ] Set browser caching headers in `.htaccess`:
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

---

## 5. Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Complete KYC
3. Get API keys from **Settings → API Keys**
4. Add to backend `.env`:  
   - `RAZORPAY_KEY_ID` = `rzp_live_xxx`  
   - `RAZORPAY_KEY_SECRET` = your secret
5. For testing, use `rzp_test_xxx` keys

---

## 6. Admin Access

- URL: `https://yourdomain.com/admin`
- Default credentials: `admin@medico.com` / `Admin@123`
- **Change the password immediately after first login** (via DB or add a change-password endpoint)

---

## 7. Update sitemap.xml

Replace `yourdomain.com` in `public/sitemap.xml` with your actual domain before building.

---

## Folder structure summary
```
/home/username/
  public_html/          ← React dist (frontend)
    index.html
    assets/
    robots.txt
    sitemap.xml
    .htaccess
  medico-backend/       ← Node.js API
    server.js
    .env
    uploads/
    node_modules/
```

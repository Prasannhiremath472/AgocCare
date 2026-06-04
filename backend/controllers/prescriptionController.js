const axios  = require('axios');
const FormData = require('form-data');
const sharp  = require('sharp');
const db     = require('../models/db');

// ─── OCR.space API — much better than Tesseract for handwriting ─────────────
// Free tier: 500 requests/month with 'helloworld' key
// Get your free key at https://ocr.space/ocrapi (free, no credit card)
const OCR_API_KEY = process.env.OCR_SPACE_KEY || 'helloworld';

async function ocrSpaceExtract(buffer) {
  // Preprocess image — upscale + enhance for better OCR
  let processedBuffer;
  try {
    processedBuffer = await sharp(buffer)
      .resize({ width: 2000, withoutEnlargement: false })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.5 })
      .jpeg({ quality: 95 })
      .toBuffer();
  } catch {
    processedBuffer = buffer;
  }

  const form = new FormData();
  form.append('apikey', OCR_API_KEY);
  form.append('language', 'eng');
  form.append('OCREngine', '2');       // Engine 2 = better for handwriting
  form.append('scale', 'true');        // Auto-scale for better recognition
  form.append('detectOrientation', 'true');
  form.append('filetype', 'JPG');
  form.append('file', processedBuffer, {
    filename: 'prescription.jpg',
    contentType: 'image/jpeg',
  });

  const res = await axios.post('https://api.ocr.space/parse/image', form, {
    headers: form.getHeaders(),
    timeout: 30000,
  });

  const result = res.data;
  if (result.IsErroredOnProcessing) {
    throw new Error(result.ErrorMessage?.[0] || 'OCR processing failed');
  }

  const text = result.ParsedResults
    ?.map(r => r.ParsedText || '')
    .join('\n') || '';

  console.log('[OCR.space] Exit code:', result.OCRExitCode);
  console.log('[OCR.space] Text:', text.substring(0, 400).replace(/\n/g, ' | '));
  return text;
}

// ─── Levenshtein similarity ──────────────────────────────────────────────────
function lev(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function sim(a, b) {
  if (!a || !b) return 0;
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return 1;
  if (la.includes(lb)) return 0.92;
  if (lb.includes(la)) return Math.min(0.88, la.length / lb.length + 0.3);
  return 1 - lev(la, lb) / Math.max(la.length, lb.length, 1);
}

// ─── Extract ngrams from OCR text ───────────────────────────────────────────
function extractNgrams(text) {
  const clean = text
    .replace(/[|\\{}[\]<>@#$%^&*_+=~`"']/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

  const words = clean.match(/[a-z]{3,}/g) || [];
  const result = new Set(words);
  for (let i = 0; i < words.length - 1; i++)
    result.add(words[i] + ' ' + words[i+1]);
  for (let i = 0; i < words.length - 2; i++)
    result.add(words[i] + ' ' + words[i+1] + ' ' + words[i+2]);
  return [...result];
}

// ─── Score product against OCR tokens ───────────────────────────────────────
function scoreProduct(product, tokens) {
  const name  = (product.name        || '').toLowerCase();
  const comp  = (product.composition || '').toLowerCase();
  const nameW = name.split(/[\s\-\/,]+/).filter(w => w.length >= 3);
  const compP = comp.split(/[,;]+/).map(s => s.trim()).filter(s => s.length >= 3);
  const compW = compP.flatMap(p => p.split(/\s+/).filter(w => w.length >= 3));
  const targets = [name, ...nameW, ...compP, ...compW];

  let best = 0, bestToken = '';
  for (const token of tokens) {
    for (const target of targets) {
      const s = sim(token, target);
      if (s > best) { best = s; bestToken = token; }
    }
  }
  return { score: best, token: bestToken };
}

// ─── Main handler ────────────────────────────────────────────────────────────
exports.extractPrescription = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  try {
    // 1. OCR via OCR.space
    const rawText = await ocrSpaceExtract(req.file.buffer);

    if (!rawText || rawText.trim().length < 3) {
      return res.json({
        medicines: [], matched_products: [], raw_text: '',
        message: 'Could not read the prescription. Please use a well-lit, clear photo.',
      });
    }

    // 2. Load all active products
    const [allProducts] = await db.query(
      `SELECT p.id, p.name, p.slug, p.price, p.mrp, p.image, p.stock,
              p.prescription_required, p.composition, c.name as category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = 1`
    );

    // 3. Extract ngrams from OCR text
    const tokens = extractNgrams(rawText);
    console.log('[Prescription] Token sample:', tokens.slice(0, 15));

    // 4. Score & filter products
    const THRESHOLD = 0.58;
    const scored = allProducts
      .map(p => ({ ...scoreProduct(p, tokens), product: p }))
      .filter(x => x.score >= THRESHOLD)
      .sort((a, b) => b.score - a.score);

    // 5. Deduplicate
    const seen = new Set();
    const unique = scored.filter(x => {
      if (seen.has(x.product.id)) return false;
      seen.add(x.product.id);
      return true;
    }).slice(0, 12);

    // 6. FALLBACK — SQL LIKE search if no fuzzy matches
    if (unique.length === 0) {
      const words = [...new Set((rawText.match(/[a-zA-Z]{4,}/g) || [])
        .map(w => w.toLowerCase()))].slice(0, 8);

      const fallbackSeen = new Set();
      const fallback = [];
      for (const word of words) {
        const [rows] = await db.query(
          `SELECT p.id, p.name, p.slug, p.price, p.mrp, p.image, p.stock,
                  p.prescription_required, c.name as category
           FROM products p LEFT JOIN categories c ON p.category_id = c.id
           WHERE (p.name LIKE ? OR p.composition LIKE ?) AND p.is_active = 1
           LIMIT 3`,
          [`%${word}%`, `%${word}%`]
        );
        rows.forEach(r => {
          if (!fallbackSeen.has(r.id)) { fallbackSeen.add(r.id); fallback.push(r); }
        });
      }

      if (fallback.length > 0) {
        const matched_products = fallback.map(p => ({
          extracted: { name: p.name, search_term: p.name.toLowerCase() },
          products: [p],
        }));
        return res.json({
          medicines: matched_products.map(g => g.extracted),
          matched_products,
          raw_text: rawText,
        });
      }

      return res.json({
        medicines: [], matched_products: [],
        raw_text: rawText,
        message: 'No matching medicines found in our store.',
      });
    }

    // 7. Group by matched token
    const groupMap = new Map();
    for (const { product, score, token } of unique) {
      const key = token.split(' ')[0];
      if (!groupMap.has(key))
        groupMap.set(key, {
          label: token.replace(/\b\w/g, c => c.toUpperCase()),
          products: [], score,
        });
      const g = groupMap.get(key);
      if (g.products.length < 3) g.products.push(product);
    }

    const groups = [...groupMap.values()].sort((a, b) => b.score - a.score);
    const matched_products = groups.map(g => ({
      extracted: { name: g.label, search_term: g.label.toLowerCase() },
      products: g.products,
    }));

    res.json({
      medicines: matched_products.map(g => g.extracted),
      matched_products,
      raw_text: rawText,
    });

  } catch (err) {
    console.error('[Prescription] Error:', err?.message || err);

    // If OCR.space fails (quota/network), fall back to Tesseract
    if (err.message?.includes('quota') || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      return res.status(503).json({
        message: 'OCR service temporarily unavailable. Please try again in a moment.',
      });
    }

    res.status(500).json({ message: 'Failed to process prescription. Please try a clearer image.' });
  }
};

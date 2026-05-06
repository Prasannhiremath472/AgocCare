const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../models/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.extractPrescription = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  // Retry helper for 503 spikes
  const callWithRetry = async (fn, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try { return await fn(); }
      catch (e) {
        if (i < retries - 1 && (e?.message?.includes('503') || e?.message?.includes('high demand'))) {
          await new Promise(r => setTimeout(r, 1500 * (i + 1)));
        } else throw e;
      }
    }
  };

  try {
    const base64Image = req.file.buffer.toString('base64');
    const mimeType    = req.file.mimetype;

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are a medical prescription reader. Analyze this prescription image carefully.

Extract ALL medicines mentioned. Return ONLY a JSON array like this:
[
  {
    "name": "medicine name as written",
    "dosage": "dosage if mentioned e.g. 500mg",
    "frequency": "how many times e.g. twice daily",
    "duration": "how long e.g. 5 days",
    "search_term": "simplified lowercase name for search e.g. paracetamol"
  }
]

Rules:
- Return ONLY the JSON array, no extra text
- If no medicines found or image is not a prescription, return []
- search_term must be lowercase without dosage numbers`;

    const result = await callWithRetry(() =>
      model.generateContent([
        prompt,
        { inlineData: { data: base64Image, mimeType } },
      ])
    );

    const text = result.response.text().trim();

    let medicines = [];
    try {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) medicines = JSON.parse(match[0]);
    } catch {
      medicines = [];
    }

    if (medicines.length === 0) {
      return res.json({
        medicines: [],
        matched_products: [],
        message: 'No medicines found. Please upload a clear prescription image.',
      });
    }

    // Search DB for each medicine
    const matched_products = [];
    for (const med of medicines) {
      const term = `%${med.search_term || med.name}%`;
      const [rows] = await db.query(
        `SELECT p.id, p.name, p.slug, p.price, p.mrp, p.image, p.stock,
                p.prescription_required, c.name as category
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE (p.name LIKE ? OR p.composition LIKE ?) AND p.is_active = 1
         LIMIT 3`,
        [term, term]
      );
      matched_products.push({ extracted: med, products: rows });
    }

    res.json({ medicines, matched_products });

  } catch (err) {
    console.error('Gemini error:', err?.message || err);
    const msg = err?.message?.includes('API_KEY') ? 'Invalid Gemini API key' :
                err?.message?.includes('quota')   ? 'API quota exceeded. Try again later.' :
                'Failed to process prescription. Please try again.';
    res.status(500).json({ message: msg });
  }
};

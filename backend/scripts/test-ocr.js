require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios    = require('axios');
const FormData = require('form-data');
const sharp    = require('sharp');

async function test() {
  // Create a test prescription image with medicine text
  const svgText = `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="200" fill="white"/>
    <text x="20" y="40"  font-size="20" font-family="Arial" fill="black">Aspirin 75mg - 3 tabs daily</text>
    <text x="20" y="80"  font-size="20" font-family="Arial" fill="black">Vitamin D3 20000IU - 3 tabs</text>
    <text x="20" y="120" font-size="20" font-family="Arial" fill="black">Insulin Glargine 100IU - 2</text>
    <text x="20" y="160" font-size="20" font-family="Arial" fill="black">Cough Syrup 100ml - 1</text>
  </svg>`;

  const imgBuf = await sharp(Buffer.from(svgText)).jpeg({ quality: 95 }).toBuffer();
  console.log('Test image created, size:', imgBuf.length, 'bytes');

  const form = new FormData();
  form.append('apikey', process.env.OCR_SPACE_KEY || 'helloworld');
  form.append('language', 'eng');
  form.append('OCREngine', '2');
  form.append('scale', 'true');
  form.append('filetype', 'JPG');
  form.append('file', imgBuf, { filename: 'prescription.jpg', contentType: 'image/jpeg' });

  try {
    const res = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    console.log('\n=== OCR.space Result ===');
    console.log('OCRExitCode:', res.data.OCRExitCode);
    console.log('IsErrored:', res.data.IsErroredOnProcessing);
    console.log('Errors:', res.data.ErrorMessage);
    console.log('Parsed Text:\n', res.data.ParsedResults?.[0]?.ParsedText);
    console.log('Confidence:', res.data.ParsedResults?.[0]?.TextOverlay?.Lines?.length, 'lines detected');
  } catch (e) {
    console.log('Request Error:', e.response?.data || e.message);
  }

  process.exit(0);
}

test().catch(console.error);

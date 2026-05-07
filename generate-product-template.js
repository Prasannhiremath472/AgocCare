const ExcelJS = require('exceljs');
const path = require('path');

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AgocCare';
  wb.created = new Date();

  // ─── Sheet 1: Product List ───────────────────────────────────────────────
  const ws = wb.addWorksheet('Product List', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'landscape', fitToPage: true }
  });

  // ── Title row ──
  ws.mergeCells('A1:L1');
  const title = ws.getCell('A1');
  title.value = 'AgocCare Private Limited — Product List Template';
  title.font = { name: 'Figtree', bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A6B' } };
  title.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 36;

  // ── Sub-title row ──
  ws.mergeCells('A2:L2');
  const sub = ws.getCell('A2');
  sub.value = 'Fill one product per row starting from Row 4. Do NOT edit column headers. Send completed file to developer.';
  sub.font = { name: 'Calibri', italic: true, size: 10, color: { argb: 'FF1A3A6B' } };
  sub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EFF9' } };
  sub.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 22;

  // ── Column definitions ──
  const columns = [
    { header: 'Product Name *',            key: 'name',         width: 28 },
    { header: 'Slug (URL) *',              key: 'slug',         width: 28 },
    { header: 'Category *',               key: 'category',     width: 18 },
    { header: 'Brand / Manufacturer *',   key: 'brand',        width: 22 },
    { header: 'Selling Price ₹ *',        key: 'price',        width: 16 },
    { header: 'MRP ₹ *',                  key: 'mrp',          width: 14 },
    { header: 'Stock Qty *',              key: 'stock',        width: 12 },
    { header: 'Composition / Salt',       key: 'composition',  width: 30 },
    { header: 'Prescription (Yes/No) *',  key: 'rx',           width: 20 },
    { header: 'Expiry Date (MM/YYYY)',    key: 'expiry',       width: 18 },
    { header: 'Description',              key: 'description',  width: 40 },
    { header: 'Image Filename',           key: 'image',        width: 22 },
  ];

  ws.columns = columns.map(c => ({ key: c.key, width: c.width }));

  // ── Header row (row 3) ──
  const headerRow = ws.getRow(3);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A6B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top:    { style: 'thin', color: { argb: 'FF00AEEF' } },
      bottom: { style: 'thin', color: { argb: 'FF00AEEF' } },
      left:   { style: 'thin', color: { argb: 'FF00AEEF' } },
      right:  { style: 'thin', color: { argb: 'FF00AEEF' } },
    };
  });
  headerRow.height = 38;

  // ── Sample rows ──
  const samples = [
    ['Paracetamol 500mg',    'paracetamol-500mg',    'Tablets',         'Sun Pharma',  25,   40,   100, 'Paracetamol IP 500mg',            'No',  '12/2026', 'Used for fever and mild to moderate pain relief.',        'paracetamol-500mg.jpg'],
    ['Metformin 500mg',      'metformin-500mg',       'Tablets',         'Cipla',       45,   70,   150, 'Metformin Hydrochloride 500mg',    'Yes', '10/2026', 'Used to treat type 2 diabetes.',                          'metformin-500mg.jpg'],
    ['Cough Syrup 100ml',    'cough-syrup-100ml',     'Syrups',          'Benadryl',    95,  130,    80, 'Diphenhydramine HCl 14.08mg',      'No',  '09/2026', 'Relieves cough and cold symptoms effectively.',           'cough-syrup-100ml.jpg'],
    ['Vitamin C 500mg',      'vitamin-c-500mg',       'Vitamins',        'Himalaya',    40,   60,   250, 'Ascorbic Acid 500mg',              'No',  '06/2027', 'Boosts immunity and acts as antioxidant.',                'vitamin-c-500mg.jpg'],
    ['Omeprazole 20mg',      'omeprazole-20mg',       'Capsules',        'Dr. Reddys',  35,   60,   180, 'Omeprazole 20mg',                  'Yes', '12/2026', 'Reduces stomach acid, treats ulcers and GERD.',           'omeprazole-20mg.jpg'],
    ['Insulin Glargine',     'insulin-glargine',      'Injections',      'Sanofi',     650,  850,    30, 'Insulin Glargine 100 IU/mL',       'Yes', '05/2026', 'Long-acting insulin for type 1 and type 2 diabetes.',     'insulin-glargine.jpg'],
    ['Cetaphil Moisturizer', 'cetaphil-moisturizer',  'Skincare',        'Galderma',   350,  450,    60, 'Glycerin, Petrolatum, Dimethicone','No',  '08/2027', 'Gentle moisturizing cream for dry and sensitive skin.',   'cetaphil-moisturizer.jpg'],
    ['Digital Thermometer',  'digital-thermometer',   'Medical Devices', 'Omron',      199,  299,    40, 'N/A',                              'No',  '12/2030', 'Fast and accurate body temperature measurement device.',  'digital-thermometer.jpg'],
  ];

  const altFill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F6FF' } };
  const whiteFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  const thinBorder = {
    top: { style: 'hair' }, bottom: { style: 'hair' },
    left: { style: 'hair' }, right: { style: 'hair' }
  };

  samples.forEach((row, ri) => {
    const wsRow = ws.getRow(ri + 4);
    row.forEach((val, ci) => {
      const cell = wsRow.getCell(ci + 1);
      cell.value = val;
      cell.fill = ri % 2 === 0 ? whiteFill : altFill;
      cell.border = thinBorder;
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', wrapText: ci === 10 };
      // Price columns — right align
      if (ci === 4 || ci === 5 || ci === 6) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '₹#,##0.00';
      }
      // Rx column — center
      if (ci === 8) cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    wsRow.height = 22;
  });

  // ── Data validation: Category dropdown (rows 4–200) ──
  for (let r = 4; r <= 200; r++) {
    ws.getCell(`C${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Tablets,Syrups,Capsules,Injections,Vitamins,Skincare,Medical Devices"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Category',
      error: 'Please select from the dropdown list.'
    };
    // Rx dropdown
    ws.getCell(`I${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Yes,No"'],
      showErrorMessage: true,
      errorTitle: 'Invalid Value',
      error: 'Please enter Yes or No only.'
    };
    // Price must be number
    ws.getCell(`E${r}`).dataValidation = {
      type: 'decimal', operator: 'greaterThan', formulae: [0],
      showErrorMessage: true, errorTitle: 'Invalid Price', error: 'Enter a valid price greater than 0.'
    };
    ws.getCell(`F${r}`).dataValidation = {
      type: 'decimal', operator: 'greaterThan', formulae: [0],
      showErrorMessage: true, errorTitle: 'Invalid MRP', error: 'Enter a valid MRP greater than 0.'
    };
    ws.getCell(`G${r}`).dataValidation = {
      type: 'whole', operator: 'greaterThanOrEqual', formulae: [0],
      showErrorMessage: true, errorTitle: 'Invalid Stock', error: 'Enter a valid stock quantity (0 or more).'
    };
  }

  // ─── Sheet 2: Instructions ────────────────────────────────────────────────
  const ws2 = wb.addWorksheet('Instructions & Guide');

  ws2.mergeCells('A1:C1');
  ws2.getCell('A1').value = 'AgocCare — Product List Instructions';
  ws2.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  ws2.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A6B' } };
  ws2.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  ws2.getRow(1).height = 36;

  const instructions = [
    ['', '', ''],
    ['FIELD', 'REQUIRED', 'INSTRUCTIONS'],
    ['Product Name',          'YES', 'Full product name with dosage. Example: Paracetamol 500mg, Cough Syrup 100ml'],
    ['Slug (URL)',             'YES', 'Lowercase only, use hyphens instead of spaces. Example: paracetamol-500mg'],
    ['Category',              'YES', 'Select from dropdown: Tablets / Syrups / Capsules / Injections / Vitamins / Skincare / Medical Devices'],
    ['Brand / Manufacturer',  'YES', 'Example: Cipla, Sun Pharma, Himalaya, Dr. Reddys, Abbott, Alkem'],
    ['Selling Price ₹',       'YES', 'Your actual selling price (numbers only, no ₹ symbol). Example: 25'],
    ['MRP ₹',                 'YES', 'Maximum Retail Price printed on the pack. Example: 40'],
    ['Stock Qty',             'YES', 'How many units currently in stock. Example: 100'],
    ['Composition / Salt',    'NO',  'Active ingredient(s). Example: Paracetamol IP 500mg | Amoxicillin 250mg'],
    ['Prescription (Yes/No)', 'YES', 'Select Yes if doctor prescription is needed, otherwise No'],
    ['Expiry Date',           'NO',  'Format: MM/YYYY — Example: 12/2026'],
    ['Description',           'NO',  '2-3 lines about the product, its uses and benefits. Keep it simple.'],
    ['Image Filename',        'NO',  'Exact filename of the product image. Example: paracetamol-500mg.jpg\nSend all images in a separate folder.'],
    ['', '', ''],
    ['IMPORTANT NOTES', '', ''],
    ['', '', '• Do NOT delete or rename column headers'],
    ['', '', '• Do NOT merge any cells'],
    ['', '', '• One product per row only'],
    ['', '', '• Selling Price must always be less than or equal to MRP'],
    ['', '', '• Use English only — no regional language text'],
    ['', '', '• Image files: JPG or PNG format, minimum 400×400 pixels, white background preferred'],
    ['', '', '• Send this Excel file + a folder of all product images to your developer'],
  ];

  ws2.columns = [{ width: 28 }, { width: 12 }, { width: 70 }];

  instructions.forEach((row, ri) => {
    const wsRow = ws2.getRow(ri + 2);
    row.forEach((val, ci) => {
      const cell = wsRow.getCell(ci + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });

    // Style header row
    if (ri === 2) {
      [1,2,3].forEach(ci => {
        const cell = wsRow.getCell(ci);
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00AEEF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      wsRow.height = 28;
    }

    // Required YES — green, NO — gray
    if (ri > 2 && ri < 14) {
      const reqCell = wsRow.getCell(2);
      if (reqCell.value === 'YES') {
        reqCell.font = { bold: true, color: { argb: 'FF39B54A' }, size: 10 };
      } else if (reqCell.value === 'NO') {
        reqCell.font = { color: { argb: 'FF888888' }, size: 10 };
      }
      wsRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF1A3A6B' } };
      wsRow.height = 28;
    }

    // Section headers
    if (row[0] === 'IMPORTANT NOTES') {
      wsRow.getCell(1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      ws2.mergeCells(`A${ri + 2}:C${ri + 2}`);
      wsRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A6B' } };
      wsRow.getCell(1).alignment = { horizontal: 'center' };
      wsRow.height = 26;
    }
  });

  // ── Save file ──
  const outPath = path.join(__dirname, 'docs', 'AgocCare_Product_List_Template.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('✅ Excel file created:', outPath);
}

generate().catch(console.error);

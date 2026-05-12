require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const mysql = require('./backend/node_modules/mysql2/promise');

const DESCRIPTIONS = {
  '1t-fol-md-tab': `1T FOL MD Tab is a nutritional supplement containing Folate (Methylfolate), Methylcobalamin, and Vitamin D3. It is specially formulated to support neurological health, red blood cell formation, and bone strength.

Key Benefits:
• Folate (L-Methylfolate): Active form of folic acid that supports DNA synthesis, cell division, and prevention of neural tube defects. Particularly important during pregnancy.
• Methylcobalamin (Vitamin B12): Essential for nerve function, myelin sheath formation, and prevention of megaloblastic anemia.
• Vitamin D3 (Cholecalciferol): Supports calcium absorption, bone mineralization, immune function, and muscle health.

Uses:
• Folic acid deficiency and megaloblastic anemia
• Neuropathy and nerve damage
• Vitamin D deficiency and osteoporosis
• During pregnancy and lactation for fetal development
• General nutritional support

Dosage: As directed by physician. Typically 1 tablet per day with meals.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store below 25°C, away from moisture and sunlight.`,

  '5t-fol-md-tab': `5T FOL MD Tab is a high-potency nutritional supplement containing Folate 5mg, Methylcobalamin, and Vitamin D3. The higher dose of folic acid (5mg) makes it suitable for therapeutic use under medical supervision.

Key Benefits:
• High-dose Folate 5mg: Used therapeutically for severe folic acid deficiency, homocystinuria, and prevention of recurrent neural tube defects.
• Methylcobalamin: Bioactive form of Vitamin B12 for superior nerve repair, cognitive function, and energy metabolism.
• Vitamin D3: Supports bone density, immune defense, hormonal balance, and cardiovascular health.

Uses:
• Treatment of severe folic acid deficiency
• Prevention of neural tube defects (high-risk pregnancies)
• Peripheral neuropathy
• Homocysteine metabolism disorders
• Vitamin D deficiency with bone loss

Dosage: As prescribed by physician. Higher folic acid content — strictly as per medical advice.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store in a cool, dry place away from direct sunlight.`,

  'afc-boost': `AFC Boost is a comprehensive multivitamin and antioxidant supplement designed to boost energy, immunity, and overall vitality. Formulated with a blend of essential vitamins, minerals, and powerful antioxidants.

Key Benefits:
• Comprehensive multivitamin formula for daily nutritional support
• Antioxidant complex combats free radical damage and oxidative stress
• Boosts energy levels and reduces fatigue
• Strengthens immune system and infection resistance
• Supports skin, hair, and nail health

Uses:
• Daily nutritional supplementation
• Immune system support
• Energy and stamina enhancement
• Recovery from illness or weakness
• General health maintenance and wellness

Dosage: 1 capsule/tablet daily after meals or as directed by physician.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store below 30°C in a dry place. Keep out of reach of children.`,

  'agerich': `Agerich is an advanced anti-aging nutritional supplement formulated with Coenzyme Q10 and key anti-aging nutrients. It supports cellular energy production, protects against oxidative damage, and promotes youthful vitality.

Key Benefits:
• Coenzyme Q10 (CoQ10): Powerful antioxidant essential for cellular energy (ATP) production, heart health, and protection against age-related cellular damage.
• Anti-aging nutrient complex: Supports skin elasticity, cognitive function, and cardiovascular health.
• Reduces signs of aging at the cellular level.
• Supports mitochondrial health and energy metabolism.

Uses:
• Age-related fatigue and weakness
• Cardiovascular support and heart health
• Skin health and anti-aging
• Neuroprotection and cognitive support
• Mitochondrial dysfunction
• Adjunct therapy in statin-induced CoQ10 depletion

Dosage: As directed by physician. Best taken with meals containing fat for optimal absorption.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store in a cool, dry place. Protect from light and moisture.`,

  'dienogest-tablets': `Dienogest Tablets 2mg is a prescription-only progestin used in the treatment of endometriosis. It is a synthetic progestogen with potent anti-androgenic properties.

Key Benefits:
• Effectively reduces endometriotic lesions and associated pain
• Anti-androgenic and anti-proliferative action on endometrial tissue
• Suppresses estrogen production locally at endometriotic sites
• Reduces dysmenorrhea (painful periods), pelvic pain, and dyspareunia

Uses:
• Treatment of endometriosis
• Reduction of endometriosis-related pain and lesions
• Long-term management of endometriosis (up to 15 months)

Important Information:
⚠ Prescription Required — For use only under gynecologist supervision
• Not recommended during pregnancy or breastfeeding
• May cause irregular bleeding, especially in the first few months
• Regular follow-up with physician is mandatory

Dosage: 1 tablet (2mg) twice daily continuously, as prescribed by gynecologist.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store below 25°C, away from moisture.`,

  'endohope-aq-50mg': `Endohope AQ 50mg Injection contains Hydroxyprogesterone Caproate, a synthetic progestin used to reduce the risk of preterm birth and support early pregnancy.

Key Benefits:
• Reduces risk of recurrent preterm delivery in singleton pregnancies
• Supports corpus luteum function in early pregnancy
• Helps maintain uterine quiescence and prevent premature contractions

Uses:
• Prevention of preterm labor and premature birth
• Threatened abortion and recurrent miscarriage
• Luteal phase support in assisted reproduction (IVF/IUI)
• Progesterone deficiency in early pregnancy

Important Information:
⚠ Prescription Required — Administer only under medical supervision
• For intramuscular injection only — do not self-administer
• Regular monitoring by obstetrician/gynecologist required

Dosage: As prescribed by physician. Typically administered as weekly intramuscular injection.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store between 15–30°C. Do not freeze. Protect from light.`,

  'folok-dha': `Folok DHA is a prenatal nutritional supplement containing Folic Acid, DHA (Docosahexaenoic Acid), and Omega-3 fatty acids. Specially designed for women during preconception, pregnancy, and lactation.

Key Benefits:
• Folic Acid: Prevents neural tube defects and supports healthy fetal brain and spinal cord development.
• DHA (Omega-3): Essential for fetal brain development, visual acuity, and cognitive function.
• Omega-3 Fatty Acids: Supports cardiovascular health, reduces inflammation, and aids fetal growth.

Uses:
• Prenatal nutritional support during pregnancy
• Prevention of neural tube defects
• Fetal brain and eye development
• Postpartum and lactation support
• Omega-3 and folate deficiency

Dosage: 1 capsule daily or as prescribed by obstetrician/gynecologist.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store in a cool dry place below 25°C. Keep away from sunlight.`,

  'h-pro-depot-500-injection': `H Pro Depot 500 Injection contains Hydroxyprogesterone Caproate 500mg, a long-acting synthetic progestogen used in the management of various gynecological conditions and threatened pregnancy loss.

Key Benefits:
• Long-acting progestogen providing sustained hormonal support
• Prevents uterine contractions and reduces risk of preterm labor
• Supports pregnancy in cases of progesterone deficiency
• Used in management of recurrent miscarriage

Uses:
• Prevention of habitual and threatened abortion
• Preterm labor prevention
• Hormonal support in early pregnancy
• Dysfunctional uterine bleeding
• Secondary amenorrhea

Important Information:
⚠ Prescription Required — For intramuscular use only under medical supervision
• Monitor liver function during prolonged use
• Not for use in known or suspected malignancy

Dosage: As prescribed by physician. Administered by intramuscular injection.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store below 25°C. Protect from light and freezing.`,

  'melatonin-vitamin-d3-tablets': `Melatonin & Vitamin D3 Tablets is a dual-action supplement combining Melatonin 5mg and Vitamin D3 1000IU to support healthy sleep cycles and immune/bone health.

Key Benefits:
• Melatonin 5mg: Natural sleep hormone that regulates the sleep-wake cycle (circadian rhythm). Helps reduce time to fall asleep and improves sleep quality.
• Vitamin D3 1000IU: Supports bone density, calcium absorption, immune function, and mood regulation.

Uses:
• Insomnia and sleep disorders
• Jet lag and shift-work sleep disorder
• Vitamin D deficiency
• Immune system support
• Seasonal affective disorder (mood support)
• Bone health and osteoporosis prevention

Dosage: 1 tablet 30–60 minutes before bedtime or as directed by physician.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store in a cool, dry place. Protect from light and moisture.`,

  'mito-q-tablets': `Mito Q Tablets contain MitoQ (Mitoquinone Mesylate), a mitochondria-targeted antioxidant that is significantly more potent than regular CoQ10. It penetrates the mitochondria directly to combat oxidative stress at its source.

Key Benefits:
• MitoQ penetrates mitochondrial membrane — 1000x more effective than standard CoQ10
• Protects mitochondria from oxidative damage and free radicals
• Supports cellular energy (ATP) production
• Reduces inflammation at cellular level
• Supports liver, heart, kidney, and cognitive health

Uses:
• Mitochondrial dysfunction and fatigue
• Cardiovascular and heart health support
• Liver health and hepatoprotection
• Neuroprotection and cognitive health
• Anti-aging and cellular vitality
• Adjunct in chronic disease management

Dosage: As directed by physician. Best absorbed on an empty stomach.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store below 25°C in a dry place. Keep sealed.`,

  'pregin-pco': `Pregin PCO is a specialized supplement for women with Polycystic Ovary Syndrome (PCOS) containing Myo-Inositol, D-Chiro Inositol, and Folic Acid in the scientifically validated 40:1 ratio.

Key Benefits:
• Myo-Inositol: Improves insulin sensitivity, restores ovarian function, and supports regular menstrual cycles in PCOS.
• D-Chiro Inositol: Reduces testosterone levels, improves metabolic parameters, and enhances egg quality.
• 40:1 ratio (Myo:D-Chiro): Clinically proven optimal ratio for PCOS management.
• Folic Acid: Supports fertility and prevents neural tube defects during conception.

Uses:
• Polycystic Ovary Syndrome (PCOS) management
• Insulin resistance and metabolic syndrome
• Ovulation induction and fertility support
• Irregular menstrual cycles
• Elevated androgen levels (hyperandrogenism)
• Adjunct in IVF/ART protocols

Dosage: As prescribed by gynecologist. Typically 1 sachet/tablet twice daily.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store in a cool, dry place below 25°C.`,

  'sodium-chloride-injection-ip': `Sodium Chloride Injection IP 0.9% (Normal Saline) is a sterile isotonic solution used for fluid and electrolyte replenishment. It is one of the most widely used intravenous fluids in clinical medicine.

Key Benefits:
• Restores extracellular fluid volume and electrolyte balance
• Isotonic — compatible with blood and body fluids
• Used as a vehicle for intravenous drug administration
• Supports hydration in dehydration and fluid loss

Uses:
• Fluid and electrolyte replacement
• Hypovolemia and dehydration
• Dilution of IV medications
• Wound irrigation and cleansing
• Nasal and eye irrigation
• Metabolic alkalosis treatment

Important Information:
⚠ Prescription Required — For hospital/clinical use under medical supervision only
• Administer intravenously under sterile conditions
• Monitor fluid balance, electrolytes, and renal function

Dosage: As prescribed by physician based on clinical indication.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store below 25°C. Do not freeze. Discard unused portion.`,

  'soft-gelatin-capsules-400mg': `Soft Gelatin Capsules 400mg contain Vitamin E (Tocopheryl Acetate) 400mg, a powerful fat-soluble antioxidant essential for immune function, skin health, and cellular protection.

Key Benefits:
• Vitamin E 400mg: Potent antioxidant that protects cells from oxidative stress and free radical damage.
• Supports skin health, elasticity, and wound healing.
• Enhances immune function and reduces inflammation.
• Protects cardiovascular health and supports healthy blood vessels.
• Improves fertility and reproductive health.

Uses:
• Vitamin E deficiency
• Skin disorders and anti-aging (topical + oral)
• Immune system support
• Cardiovascular protection
• Male and female fertility support
• Neuroprotection and muscle health

Dosage: 1 soft gelatin capsule daily after meals or as directed by physician.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store in a cool, dry place below 25°C. Protect from light.`,

  'tadalafil-tablets-ip-5mg': `Tadalafil Tablets IP 5mg is a prescription phosphodiesterase type-5 (PDE5) inhibitor used for the treatment of erectile dysfunction and benign prostatic hyperplasia (BPH).

Key Benefits:
• Long-acting PDE5 inhibitor with up to 36-hour duration of action
• Improves erectile function by increasing blood flow to penile tissue
• Treats benign prostatic hyperplasia (BPH) symptoms
• Also used for pulmonary arterial hypertension (PAH)
• Low daily dose (5mg) option for continuous therapy

Uses:
• Erectile Dysfunction (ED)
• Benign Prostatic Hyperplasia (BPH) — urinary symptoms
• Pulmonary Arterial Hypertension (PAH)
• Combined ED and BPH

Important Information:
⚠ Prescription Required — Consult urologist/physician before use
• Do not take with nitrates (severe hypotension risk)
• Not recommended in severe cardiovascular disease
• Side effects may include headache, flushing, back pain, dyspepsia

Dosage: 5mg once daily at the same time each day, or as prescribed by physician.
Manufacturer: Agoc Care Pvt. Ltd.
Storage: Store below 30°C in a dry place. Keep out of reach of children.`,
};

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });

  let updated = 0;
  for (const [slug, description] of Object.entries(DESCRIPTIONS)) {
    const [r] = await pool.query(
      'UPDATE products SET description = ? WHERE slug = ?',
      [description, slug]
    );
    if (r.affectedRows) {
      console.log(`✅ Updated: ${slug}`);
      updated++;
    } else {
      console.log(`⚠️  Not found: ${slug}`);
    }
  }

  console.log(`\n✅ Done — ${updated} products updated with descriptions.`);
  process.exit();
}

run().catch(e => { console.error(e.message); process.exit(1); });

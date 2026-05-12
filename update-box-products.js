require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const mysql = require('./backend/node_modules/mysql2/promise');

const PRODUCTS = [
  {
    id: 49, name: 'AGO 9 Sachet', slug: 'ago-9-sachet', cat: 5, rx: 0,
    comp: 'L-Arginine, Zinc & Folic Acid (Sugar Free)',
    desc: `AGO 9 Sachet is a sugar-free nutritional supplement containing L-Arginine, Zinc, and Folic Acid, formulated to support reproductive health, immunity, and cellular function.

Key Benefits:
• L-Arginine: Amino acid that improves blood circulation, nitric oxide production, and supports male reproductive health and sperm quality.
• Zinc: Essential mineral for immune function, testosterone production, and enzyme activity.
• Folic Acid: Vital for DNA synthesis, cell division, and prevention of neural tube defects.
• Sugar-free — safe for diabetic patients.

Uses:
• Male infertility and poor sperm quality
• Immune system support
• General nutritional deficiency
• Pre-conception supplementation for both partners

Pack: 10x5 gm Sachets | Dosage: 1 sachet daily dissolved in water or as directed by physician.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store below 25°C in a cool, dry place.`
  },
  {
    id: 50, name: 'Agoc-SP Tablets', slug: 'agoc-sp-tablets', cat: 1, rx: 1,
    comp: 'Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg',
    desc: `Agoc-SP is a combination tablet containing Aceclofenac, Paracetamol, and Serratiopeptidase — a powerful anti-inflammatory, analgesic, and anti-edematous formulation.

Key Benefits:
• Aceclofenac 100mg: NSAID that reduces pain and inflammation by inhibiting prostaglandin synthesis.
• Paracetamol 325mg: Analgesic and antipyretic for fever and mild-to-moderate pain.
• Serratiopeptidase 15mg: Proteolytic enzyme that reduces swelling and speeds tissue healing.

Uses:
• Post-surgical and post-traumatic pain
• Musculoskeletal pain and arthritis
• Dental pain and inflammation
• Sports injuries and sprains
• Acute and chronic inflammatory conditions

Important: Prescription Required
Dosage: 1 tablet twice daily after meals or as directed by physician.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store below 25°C.`
  },
  {
    id: 51, name: 'Agoc-P Tablets', slug: 'agoc-p-tablets', cat: 1, rx: 1,
    comp: 'Aceclofenac 100mg + Paracetamol 325mg IP',
    desc: `Agoc-P is a combination tablet containing Aceclofenac and Paracetamol IP, providing dual-action pain relief and anti-inflammatory effect.

Key Benefits:
• Aceclofenac 100mg: Potent NSAID that inhibits COX enzymes, reducing pain and inflammation effectively.
• Paracetamol 325mg: Centrally acting analgesic for additional pain relief and fever reduction.

Uses:
• Osteoarthritis and rheumatoid arthritis
• Back pain and sciatica
• Dental and post-operative pain
• Headache, fever, and body ache
• Musculoskeletal disorders

Important: Prescription Required
Dosage: 1 tablet twice daily after meals or as directed by physician.
Pack: 10x10 Tablets | Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store below 25°C.`
  },
  {
    id: 52, name: 'Agocet-5 Tablets', slug: 'agocet-5-tablets', cat: 1, rx: 1,
    comp: 'Levocetirizine Hydrochloride IP 5mg',
    desc: `Agocet-5 contains Levocetirizine Hydrochloride 5mg, a second-generation antihistamine that is a potent and selective H1 receptor antagonist for allergic conditions.

Key Benefits:
• Levocetirizine 5mg: More potent than cetirizine with fewer side effects and longer duration of action.
• Provides rapid relief from allergic symptoms.
• Non-sedating at recommended doses.
• Effective for both seasonal and perennial allergic rhinitis.

Uses:
• Allergic rhinitis (hay fever)
• Chronic urticaria (hives)
• Skin allergies and itching
• Allergic conjunctivitis

Important: Prescription Required
Dosage: 1 tablet once daily at bedtime or as directed by physician.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store protected from light and moisture below 30°C.`
  },
  {
    id: 53, name: 'Agocet-M Tablets', slug: 'agocet-m-tablets', cat: 1, rx: 1,
    comp: 'Montelukast Sodium 10mg + Levocetirizine Dihydrochloride 5mg',
    desc: `Agocet-M is a combination of Montelukast and Levocetirizine providing comprehensive dual-action relief from allergic conditions.

Key Benefits:
• Montelukast 10mg: Blocks leukotriene receptors, reducing airway inflammation and allergic nasal symptoms.
• Levocetirizine 5mg: Antihistamine providing rapid relief from sneezing, itching, and runny nose.
• Dual mechanism provides superior allergy control compared to single agents.

Uses:
• Allergic rhinitis with asthmatic component
• Chronic urticaria
• Seasonal and perennial allergic rhinitis
• Asthma prophylaxis

Important: Prescription Required — Schedule H Drug
Dosage: 1 tablet daily at bedtime as directed by physician.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store protected from light and moisture below 30°C.`
  },
  {
    id: 38, name: 'Agocet-10 Tablets', slug: 'agocet-10-tablets', cat: 1, rx: 1,
    comp: 'Levocetirizine Hydrochloride Tablets IP 10mg',
    desc: `Agocet-10 contains Levocetirizine Hydrochloride 10mg, a higher-dose antihistamine for severe allergic conditions requiring stronger antihistamine therapy.

Key Benefits:
• Levocetirizine 10mg: Higher strength for severe allergic conditions.
• Rapid onset with 24-hour coverage.
• Minimal sedation at therapeutic doses.
• Highly selective H1 receptor antagonist.

Uses:
• Severe allergic rhinitis
• Chronic idiopathic urticaria
• Angioedema
• Severe skin allergies and pruritus
• Atopic dermatitis

Important: Prescription Required
Dosage: As directed by physician.
Pack: 10x10 Tablets | Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store protected from light and moisture below 30°C.`
  },
  {
    id: 39, name: 'Agoglut 600 Injection', slug: 'agoglut-600-injection', cat: 4, rx: 1,
    comp: 'Glutathione 600mg + Vitamin C (Lyophilized Powder for Injection)',
    desc: `Agoglut 600 is a lyophilized injectable preparation containing Glutathione 600mg with Vitamin C, used as a powerful antioxidant therapy.

Key Benefits:
• Glutathione 600mg: Master antioxidant that neutralizes free radicals, supports detoxification, and promotes skin brightening.
• Vitamin C: Enhances glutathione stability, boosts immune function, and supports collagen synthesis.
• Lyophilized powder — maintains potency and stability.
• For IM/IV use only — single dose vial.

Uses:
• Skin brightening and hyperpigmentation
• Liver detoxification and hepatoprotection
• Antioxidant therapy in chronic diseases
• Immune system support
• Heavy metal detoxification

Important: Prescription Required — For use under medical supervision only
Dosage: As prescribed by physician. IM or IV injection only.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store below 25°C. Protect from light. Do not freeze.`
  },
  {
    id: 40, name: 'Agohem-FB Tablets', slug: 'agohem-fb-tablets', cat: 5, rx: 0,
    comp: 'Ferrous Bisglycinate + Zinc Bisglycinate + Folic Acid + Methylcobalamin',
    desc: `Agohem-FB is a comprehensive iron and nutritional supplement tablet in bisglycinate form ensuring superior absorption with minimal gastrointestinal side effects.

Key Benefits:
• Ferrous Bisglycinate: Highly bioavailable chelated iron — better absorbed with fewer GI side effects than ferrous sulfate.
• Zinc Bisglycinate: Chelated zinc for enhanced absorption and immune support.
• Folic Acid: Essential for red blood cell formation and DNA synthesis.
• Methylcobalamin: Active B12 for nerve health and energy metabolism.

Uses:
• Iron deficiency anemia
• Pregnancy and lactation nutritional support
• Megaloblastic anemia
• Prevention of neural tube defects

Pack: 10x15 Tablets | Dosage: 1 tablet daily after meals or as directed.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store below 25°C.`
  },
  {
    id: 41, name: 'Agoc Care Supplement Tablets', slug: 'agoc-care-supplement-tablets', cat: 5, rx: 0,
    comp: 'Nutritional Supplement',
    desc: `Agoc Care Supplement Tablets are a nutritional supplement formulation manufactured by Agoc Care Pvt. Ltd. under WHO-GMP certified conditions to support general health and wellbeing.

Uses:
• General nutritional supplementation
• Daily health maintenance
• Nutritional deficiency support

Dosage: As directed by physician.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store in a cool, dry place below 25°C.`
  },
  {
    id: 42, name: 'Agohem Tablets', slug: 'agohem-tablets', cat: 5, rx: 0,
    comp: 'Ferrous Ascorbate 100mg (Elemental Iron) + Folic Acid 1.5mg',
    desc: `Agohem Tablets contain Ferrous Ascorbate and Folic Acid for prevention and treatment of iron deficiency anemia. Ferrous Ascorbate is a unique chelated iron with excellent bioavailability.

Key Benefits:
• Ferrous Ascorbate (Iron 100mg): Superior bioavailable iron with minimal gastric irritation.
• Folic Acid 1.5mg: Supports red blood cell maturation and DNA synthesis.
• Dual-action formula addresses both iron deficiency and megaloblastic anemia.

Uses:
• Iron deficiency anemia
• Nutritional anemia during pregnancy
• Post-delivery iron replenishment
• Pre-operative iron supplementation

Dosage: 1 tablet daily after meals or as directed by physician.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store below 25°C. Protect from light.`
  },
  {
    id: 43, name: 'Agolet-5 Tablets', slug: 'agolet-5-tablets', cat: 1, rx: 1,
    comp: 'Letrozole (SR) 5mg',
    desc: `Agolet-5 contains Letrozole 5mg SR — a third-generation aromatase inhibitor used for hormone-dependent breast cancer and ovulation induction in infertile women.

Key Benefits:
• Letrozole SR 5mg: Potent aromatase inhibitor that reduces estrogen levels by blocking androgen-to-estrogen conversion.
• Superior ovulation induction agent compared to clomiphene citrate.
• Extended-release formulation for sustained drug levels.

Uses:
• Breast cancer (hormone receptor-positive)
• Ovulation induction in PCOS and anovulatory infertility
• Female infertility treatment
• Adjuvant therapy in postmenopausal breast cancer

Important: Prescription Required — Use strictly under gynecologist/oncologist supervision.
Dosage: As prescribed by physician only.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store below 25°C.`
  },
  {
    id: 44, name: 'Agoc Care Film Coated Tablets', slug: 'agoc-care-film-coated-tablets', cat: 1, rx: 1,
    comp: 'Pharmaceutical Film Coated Tablets',
    desc: `Agoc Care Film Coated Tablets are pharmaceutical-grade tablets manufactured by Agoc Care Pvt. Ltd. under strict quality control and certified GMP standards.

Important: Prescription Required
Dosage: As directed by physician.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store in a cool, dry place below 25°C.`
  },
  {
    id: 45, name: 'Alkarine Syrup', slug: 'alkarine-syrup', cat: 1, rx: 0,
    comp: 'Disodium Hydrogen Citrate BP 1.4g per 5ml',
    desc: `Alkarine Syrup contains Disodium Hydrogen Citrate, an alkalizing agent that maintains pH balance of urine. Used in UTI and gout management.

Key Benefits:
• Disodium Hydrogen Citrate 1.4g/5ml: Alkalizes urine by converting to bicarbonate, raising urinary pH.
• Reduces uric acid crystallization in the urinary tract.
• Helps dissolve uric acid kidney stones.
• Relieves burning sensation during urination.

Uses:
• Urinary tract infections (UTI)
• Gout and hyperuricemia
• Uric acid kidney stones
• Burning micturition
• Metabolic acidosis

Dosage: As directed by physician. Shake well before use.
Manufacturer: Red Cross Formulation, Aurangabad (Marketed by Agoc Care Pvt. Ltd.)
Storage: Store in a cool, dry place. Keep tightly closed.`
  },
  {
    id: 46, name: 'Agoc Care Pharmaceutical Capsules', slug: 'agoc-care-pharmaceutical-capsules', cat: 3, rx: 1,
    comp: 'Pharmaceutical Capsules',
    desc: `Agoc Care Pharmaceutical Capsules are high-quality capsules manufactured by Agoc Care Pvt. Ltd. under WHO-GMP certified conditions.

Important: Prescription Required
Dosage: As directed by physician.
Manufacturer: Agoc Care Pvt. Ltd. | Storage: Store in a cool, dry place below 25°C.`
  },
  {
    id: 47, name: 'E2 Max Tablets', slug: 'e2-max-tablets', cat: 1, rx: 1,
    comp: 'Estradiol Valerate BP 2mg',
    desc: `E2 Max Tablets contain Estradiol Valerate 2mg, a natural estrogen used in hormone replacement therapy and reproductive medicine. Marketed by Agoc Care Pvt. Ltd.

Key Benefits:
• Estradiol Valerate 2mg: Synthetic estrogen identical to natural estradiol for hormone replacement and endometrial preparation.
• Essential in IVF and ART protocols for endometrial lining development.
• Relieves menopausal symptoms effectively.

Uses:
• Hormone replacement therapy (HRT) in menopause
• Endometrial preparation in IVF/ART cycles
• Hypogonadism and estrogen deficiency
• Primary ovarian insufficiency
• Symptomatic menopause — hot flashes, vaginal dryness

Important: Prescription Required — Use strictly under gynecologist supervision.
Pack: 21 Tablets | Dosage: As prescribed by physician.
Marketed by: Agoc Care Pvt. Ltd. | Storage: Store below 25°C. Protect from light.`
  },
  {
    id: 48, name: 'Dydrogesterone Tablets 10mg', slug: 'dydrogesterone-tablets-10mg', cat: 1, rx: 1,
    comp: 'Dydrogesterone IP 10mg',
    desc: `Dydrogesterone Tablets 10mg contain Dydrogesterone, a synthetic progestogen closely resembling natural progesterone, widely used in gynecological conditions requiring progesterone support.

Key Benefits:
• Dydrogesterone 10mg: Orally active progestogen with high selectivity for progesterone receptors — no androgenic or estrogenic side effects.
• Supports endometrial lining for successful implantation.
• Does not suppress ovulation at therapeutic doses.
• Excellent safety profile in pregnancy.

Uses:
• Threatened and recurrent miscarriage
• Luteal phase support in IVF/IUI
• Endometriosis
• Irregular menstrual cycles and dysmenorrhea
• Secondary amenorrhea

Important: Prescription Required — Schedule H Drug
Dosage: As prescribed by gynecologist. Typically 10mg twice daily.
Manufacturer: Symbiosis Pharmaceuticals Pvt. Ltd. (Marketed by Agoc Care Pvt. Ltd.)
Storage: Store in a cool, dark, dry place below 25°C.`
  },
];

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME
  });

  for (const p of PRODUCTS) {
    await pool.query(
      'UPDATE products SET name=?, slug=?, composition=?, category_id=?, prescription_required=?, description=? WHERE id=?',
      [p.name, p.slug, p.comp, p.cat, p.rx, p.desc, p.id]
    );
    console.log('✅', p.id, p.name);
  }
  console.log('\n✅ All 16 box products updated with correct names and descriptions!');
  process.exit();
}

run().catch(e => { console.error(e.message); process.exit(1); });

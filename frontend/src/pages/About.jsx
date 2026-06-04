import { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, fadeUp, fadeLeft, fadeRight, viewport } from '../utils/motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const GALLERY = [
  // Team / People
  { src: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80', caption: 'Our Team' },
  { src: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80', caption: 'Team Meeting' },
  { src: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80', caption: 'Healthcare Professionals' },
  { src: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&q=80', caption: 'Medical Staff' },
  { src: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&q=80', caption: 'Team Collaboration' },
  { src: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80', caption: 'Doctor Consultation' },
  // Activities / Operations
  { src: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80', caption: 'Our Pharmacy Store' },
  { src: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', caption: 'Medicine Distribution' },
  { src: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80', caption: 'Our Product Range' },
  { src: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80', caption: 'Wholesale Operations' },
  { src: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80', caption: 'Vitamin Supplements' },
  { src: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=600&q=80', caption: 'Product Packaging' },
];

const SECTIONS = [
  { id: 'company-info', label: 'Our Wholesale Shop' },
  { id: 'retail',       label: 'Our Retail Shops'   },
  { id: 'our-products', label: 'Our Products'        },
  { id: 'gallery',      label: 'Gallery'             },
  { id: 'board',        label: 'Board Members'       },
  { id: 'contact',      label: 'Contact Us'          },
];

function DirectorCard({ director: d }) {
  const [showMore, setShowMore] = useState(false);
  const imgSrc = `${import.meta.env.PROD ? '' : 'http://localhost:5000'}/uploads/Directors/${d.img}`;
  return (
    <motion.div variants={staggerItem}
      className="bg-white rounded-2xl border border-teal-mid/30 shadow-card overflow-hidden">
      {/* Top — photo + name */}
      <div className="flex flex-col items-center pt-8 pb-5 px-6 text-center">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg mb-4">
          <img src={imgSrc} alt={d.name} className="w-full h-full object-cover object-top"
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', d.color);
              e.target.parentNode.innerHTML = `<span class="text-white text-3xl font-extrabold">${d.initials}</span>`;
            }}/>
        </div>
        <h3 className="text-xl font-extrabold text-teal">{d.name}</h3>
        <p className="text-secondary font-bold text-sm mt-1">{d.role}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-100 border-t border-gray-100">
        {d.stats.map(s => (
          <div key={s.label} className="bg-white px-4 py-3 text-center">
            <p className="text-base font-extrabold text-primary">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Show More toggle */}
      <div className="px-6 pb-6 pt-4">
        <AnimatePresence>
          {showMore && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="overflow-hidden">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{d.bio}</p>
              <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary">
                {d.vision}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setShowMore(v => !v)}
          className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-bold text-primary border border-primary/30 rounded-xl py-2.5 hover:bg-primary hover:text-white transition-all duration-200">
          {showMore ? 'Show Less ▲' : 'Show More ▼'}
        </button>
      </div>
    </motion.div>
  );
}

export default function About() {
  const { hash } = useLocation();
  const [lightbox, setLightbox] = useState(null); // index of open image

  // Scroll to anchor on load/hash change
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [hash]);

  return (
    <>
      <SeoHead pageKey="about" defaults={{ title: 'About Us | AgocCare', description: 'Agoc Care Pvt Ltd – Licensed pharmaceutical company offering wholesale, retail & online medicine delivery since 2016.' }} />
      <div className="bg-teal-light min-h-screen">

        {/* Hero */}
        <section className="bg-primary py-16 px-4 text-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="visible" className="max-w-2xl mx-auto">
            <motion.img
              variants={fadeUp}
              src="/Agoccarelogo.jpeg"
              alt="AgocCare"
              className="h-24 w-auto object-contain mx-auto mb-6 rounded-2xl shadow-lg bg-white p-2"
            />
            <motion.p variants={fadeUp} className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">About Us</motion.p>
            {/* <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Agoc Care Pvt. Ltd.
            </motion.h1> */}
            {/* <motion.p variants={fadeUp} className="text-white/70 text-base leading-relaxed">
              Empowering Life — Licensed pharma marketing, wholesale & retail since 2016.
            </motion.p> */}
          </motion.div>

          {/* Quick nav pills */}
          <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible"
            className="flex flex-col items-center gap-3 mt-10 w-full max-w-2xl mx-auto">

            {/* Row 1 — two big featured buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {SECTIONS.slice(0, 2).map(s => (
                <motion.a key={s.id} variants={staggerItem} href={`#${s.id}`}
                  onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                  whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center justify-center gap-1 px-6 py-5 bg-white/25 border-2 border-white/50 text-white text-base font-black rounded-2xl hover:bg-white/35 transition-colors cursor-pointer shadow-xl tracking-wide text-center">
                  <span className="text-2xl">{s.id === 'wholesale' ? '🏭' : '🏪'}</span>
                  {s.label}
                </motion.a>
              ))}
            </div>

            {/* Row 2 — remaining smaller buttons */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {SECTIONS.slice(2).map(s => (
                <motion.a key={s.id} variants={staggerItem} href={`#${s.id}`}
                  onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                  whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.30)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-white/20 border-2 border-white/40 text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-colors cursor-pointer shadow-lg tracking-wide">
                  {s.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Section 1: Company Information ── */}
        <section id="company-info" className="section bg-white scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <motion.div className="grid md:grid-cols-2 gap-10 items-start"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              <motion.div variants={fadeLeft}>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">About Us</p>
                <h2 className="text-3xl font-extrabold text-teal mb-4">Company Information</h2>
                <p className="text-gray-500 leading-relaxed mb-3">
                  Agoc Care Private Limited operates a fully licensed wholesale division supplying pharmaceutical products to retailers, hospitals, clinics, and distributors across Maharashtra and pan-India.
                </p>
                <p className="text-gray-500 leading-relaxed mb-4">
                  We deal in a wide range of medicines including tablets, capsules, syrups, injections, vitamins, and specialty formulations — all sourced directly from licensed manufacturers with proper batch documentation and cold-chain compliance.
                </p>
                <div className="flex flex-col gap-2 text-sm">
                  {['Drug License No: 20B-618039','GSTIN: 27AAOCA4424F1ZQ','Min Order: Contact for bulk pricing','Delivery: Pan India'].map(t => (
                    <div key={t} className="flex items-center gap-2 text-teal">
                      <svg className="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={fadeRight}>
                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex flex-col gap-3">
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Company Details</p>
                  {[
                    { label:'Wholesale License', value:'20B-618039' },
                    { label:'Drug License',       value:'21B-618040' },
                    { label:'GSTIN',              value:'27AAOCA4424F1ZQ' },
                    { label:'Established',        value:'2016' },
                    { label:'Type',               value:'Pharma Marketing & Wholesale' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between border-b border-primary/10 pb-2.5 last:border-0 last:pb-0">
                      <span className="text-sm font-bold text-teal">{r.label}</span>
                      <span className="text-sm text-gray-600">{r.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Section 2: Our Wholesale Shop ── */}
        <section id="wholesale" className="section bg-primary/5 scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
              className="text-center mb-10">
              <p className="text-base font-bold text-secondary uppercase tracking-widest mb-2">Medical Locations</p>
              <h2 className="text-5xl font-extrabold text-teal">Our Wholesale Shop</h2>
              <p className="text-gray-500 text-base mt-2 max-w-xl mx-auto">Visit us at any of our registered locations across Maharashtra.</p>
            </motion.div>
            <motion.div className="grid md:grid-cols-3 gap-6"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              {[
                {
                  type: 'Registered Office',
                  name: 'Agoc Care Pvt. Ltd.',
                  address: '484/2 Waras Gaon Naka, Post Kolad, Taluka - Roha, Dist - Raigad, Maharashtra, India 402304',
                  icon: '🏢',
                  color: 'bg-blue-50 border-blue-200',
                  badge: 'bg-blue-100 text-blue-700',
                  header: 'bg-blue-600',
                },
                {
                  type: 'Depot Address',
                  name: 'Agoc Care Pvt. Ltd.',
                  address: 'Shree Complex, Shop No. 1, First Floor, Main Road Kodoli, Tal - Panhala, Dist - Kolhapur 416114',
                  icon: '🏭',
                  color: 'bg-purple-50 border-purple-200',
                  badge: 'bg-purple-100 text-purple-700',
                  header: 'bg-purple-600',
                },
                {
                  type: 'Shop Address',
                  name: 'Aapli Pharmacy',
                  address: '1511 2nd Floor, Mahalaxmi Square, Kodoli, Tal - Panhala, Dist - Kolhapur 416114',
                  icon: '🏪',
                  color: 'bg-green-50 border-green-200',
                  badge: 'bg-green-100 text-green-700',
                  header: 'bg-green-600',
                },
              ].map((loc, i) => (
                <motion.div key={i} variants={staggerItem}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`rounded-2xl border overflow-hidden shadow-sm ${loc.color}`}>
                  {/* Card header */}
                  <div className={`${loc.header} px-5 py-4 flex items-center gap-3`}>
                    <span className="text-3xl">{loc.icon}</span>
                    <span className="text-white font-black text-base tracking-wide">{loc.type}</span>
                  </div>
                  {/* Card body */}
                  <div className="px-5 py-5">
                    <p className="text-base font-black text-teal mb-2">{loc.name}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{loc.address}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Retail ── */}
        <section id="retail" className="section bg-teal-light scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
              className="text-center mb-10">
              <p className="text-base font-bold text-secondary uppercase tracking-widest mb-2">Medical Locations</p>
              <h2 className="text-5xl font-extrabold text-teal">Our Retail Shops</h2>
              <p className="text-gray-500 text-base mt-2 max-w-xl mx-auto">
                Find us at these locations across Kolhapur and nearby areas. Click the map icon to get directions.
              </p>
            </motion.div>

            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer(0.06)} initial="hidden" whileInView="visible" viewport={viewport}>
              {[
                { name:'Amit R Medical',     area:'Paanch Bangala'  },
                { name:'Amit R Medical',     area:'Rajarampuri'     },
                { name:'Amit R Medical',     area:'Racecourse Naka' },
                { name:'Amit R Medical',     area:'Station Road'    },
                { name:'Amit R Medical',     area:'Rankala Stand'   },
                { name:'Amit R Medical',     area:'Nagala Park'     },
                { name:'Amit R Medical',     area:'Kodoli'          },
                { name:'Amit R Medical',     area:'Khed'            },
                { name:'Amit R Medical',     area:'Hupari'          },
                { name:'D&C Care Pharmacy',  area:'Gadhinglaj'      },
                { name:'Princess Matching',  area:'Gadhinglaj'      },
                { name:'My Baby',            area:'Ghati Darwaja'   },
              ].map((shop, i) => (
                <motion.div key={i} variants={staggerItem}
                  whileHover={{ y:-3, transition:{ duration:0.2 } }}
                  className="bg-white rounded-2xl border border-teal-mid/30 shadow-sm px-4 py-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">🏪</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-teal truncate">{shop.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {shop.area}
                    </p>
                  </div>
                  <a href="https://share.google/vhIeljqAFweHKrdqt" target="_blank" rel="noopener noreferrer"
                    className="shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors"
                    title="View on Google Maps">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </a>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
              className="mt-8 bg-primary/5 rounded-2xl p-4 border border-primary/15 text-center text-xs text-gray-500">
              📞 For retail enquiries call: <a href="tel:+919923268310" className="text-primary font-bold">+91 99232 68310</a>
              &nbsp;·&nbsp; Mon–Sat: 9:00 AM – 7:00 PM
            </motion.div>
          </div>
        </section>

        {/* ── Our Products ── */}
        <section id="our-products" className="section bg-white scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <motion.div className="text-center mb-10"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Product Range</p>
              <h2 className="text-3xl font-extrabold text-teal mb-3">Our Products</h2>
              <p className="text-gray-500 max-w-xl mx-auto">We offer a comprehensive range of pharmaceutical products across all major categories.</p>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5"
              variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={viewport}>
              {[
                { cat:'Tablets',         desc:'Wide range of oral tablet formulations for various therapeutic indications.' },
                { cat:'Capsules',        desc:'Soft and hard gelatin capsules including specialty nutrient formulations.' },
                { cat:'Syrups',          desc:'Liquid oral formulations for cough, digestion, vitamins and more.' },
                { cat:'Injections',      desc:'Sterile injectable solutions for hospital and clinical use.' },
                { cat:'Vitamins',        desc:'Complete range of vitamin and mineral supplements for all age groups.' },
                { cat:'Specialty',       desc:'Specialty products including women\'s health, anti-aging, and nutraceuticals.' },
              ].map(p => (
                <motion.div key={p.cat} variants={staggerItem}
                  className="bg-teal-light rounded-2xl p-5 border border-teal-mid/30">
                  <h3 className="font-extrabold text-teal mb-2">{p.cat}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div className="text-center mt-8" variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
              <Link to="/medicines" className="btn-primary px-8">Browse All Products →</Link>
            </motion.div>
          </div>
        </section>

        {/* ── Board Members ── */}
        <section id="board" className="section bg-teal-light scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <motion.div className="text-center mb-10"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
              <p className="text-base font-bold text-secondary uppercase tracking-widest mb-2">Leadership</p>
              <h2 className="text-5xl font-extrabold text-teal">Board Members</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              {[
                {
                  img: 'director1.png', name: 'Dadaso Vasant Kadavekar', initials: 'DK', color: 'bg-primary',
                  role: 'Director — Retail & Wholesale',
                  stats: [
                    { label: 'Industry Experience', value: '29 Years' },
                    { label: 'Retail Business Since', value: '1997' },
                    { label: 'Wholesale Since',       value: '2014' },
                    { label: 'Company Registered',    value: '2016' },
                  ],
                  bio: 'Leading pharma marketing, wholesale medical distribution & retail medical stores across Maharashtra for over 10 years. Agoc Care Pvt. Ltd. operates licensed wholesale & retail pharma business.',
                  vision: '🚀 Vision: Launch company pan-India within the next 4 years.',
                },
                {
                  img: 'director2.jpeg', name: 'Ashok Sakharam Surve', initials: 'AS', color: 'bg-secondary',
                  role: 'Director — Sales & Marketing',
                  stats: [
                    { label: 'Industry Experience', value: '29 Years' },
                    { label: 'Career Started',      value: '1997 as MR' },
                    { label: 'Promoted to ZSM',     value: '2016' },
                    { label: 'Current Role',        value: 'Zonal Sales Manager' },
                  ],
                  bio: 'Started career in 1997 as a Medical Representative and rose to Zonal Sales Manager (ZSM) by 2016. Brings deep expertise in pharmaceutical sales, marketing, and zonal distribution management.',
                  vision: '🚀 Vision: Launch company pan-India within the next 4 years.',
                },
              ].map(d => <DirectorCard key={d.name} director={d} />)}
            </motion.div>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section id="gallery" className="py-16 scroll-mt-20 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <motion.div className="text-center mb-10"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Activities</p>
              <h2 className="text-3xl font-extrabold text-teal mb-3">Gallery</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm">A glimpse into our operations, team activities and healthcare initiatives.</p>
            </motion.div>
          </div>

          {/* Full width slider — no container constraint */}
          <div className="w-full overflow-hidden">
              <Swiper
                modules={[Autoplay]}
                slidesPerView="auto"
                spaceBetween={16}
                loop={true}
                speed={3000}
                autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
                allowTouchMove={true}
                className="!overflow-visible"
              >
                {[...GALLERY, ...GALLERY].map((img, i) => (
                  <SwiperSlide key={i} style={{ width: '340px' }}>
                    <div onClick={() => setLightbox(i % GALLERY.length)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-card"
                      style={{ height: '260px' }}>
                      <img src={img.src} alt={img.caption}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"/>
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-all duration-300 flex items-end">
                        <div className="w-full px-3 py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-xs font-semibold">{img.caption}</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
            className="text-center text-xs text-gray-400 mt-6 px-4">
            * Placeholder images shown. Real activity photos will be updated soon.
          </motion.p>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightbox !== null && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setLightbox(null)}>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                className="relative max-w-4xl w-full"
                onClick={e => e.stopPropagation()}>
                <img src={GALLERY[lightbox].src} alt={GALLERY[lightbox].caption}
                  className="w-full max-h-[80vh] object-contain rounded-2xl"/>
                <p className="text-white text-center mt-3 text-sm font-semibold">{GALLERY[lightbox].caption}</p>
                {/* Close */}
                <button onClick={() => setLightbox(null)}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
                {/* Prev */}
                <button onClick={() => setLightbox(i => (i - 1 + GALLERY.length) % GALLERY.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                {/* Next */}
                <button onClick={() => setLightbox(i => (i + 1) % GALLERY.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Contact ── */}
        <section id="contact" className="section bg-white scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <motion.div className="text-center mb-10"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Get In Touch</p>
              <h2 className="text-3xl font-extrabold text-teal">Contact Us</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 gap-5"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              {[
                { label:'Customer Support', value:'+91 99232 68310',    icon:'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 12.45a19.79 19.79 0 01-3.07-8.67A2 2 0 011.72 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L5.25 10.1a16 16 0 006.29 6.29l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z' },
                { label:'WhatsApp',         value:'+91 91589 90002',    icon:'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 12.45a19.79 19.79 0 01-3.07-8.67A2 2 0 011.72 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L5.25 10.1a16 16 0 006.29 6.29l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z' },
                { label:'Email',            value:'agoccarepvtltd@gmail.com', icon:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { label:'Support Hours',    value:'Mon–Sat: 9:00 AM – 7:00 PM', icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label:'Office Address',   value:'Palladium Building, Near Pristine Womens Hospital, Assembly Road, Shahupuri, Kolhapur', icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                { label:'Reg. Address',     value:'484/2 Warasgoan Naka, Post Kolad, Tal Kolad, Dist Raigad, Maharashtra – 402304', icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              ].map(c => (
                <motion.div key={c.label} variants={staggerItem}
                  className="bg-teal-light rounded-2xl p-5 border border-teal-mid/30 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon}/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{c.label}</p>
                    <p className="text-sm font-semibold text-teal leading-relaxed">{c.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Licenses */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
              className="mt-8 bg-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Licenses & Registration</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-teal font-semibold">
                <span>GSTIN: 27AAOCA4424F1ZQ</span>
                <span className="text-gray-300">|</span>
                <span>Drug Lic: 20B-618039</span>
                <span className="text-gray-300">|</span>
                <span>Drug Lic: 21B-618040</span>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}

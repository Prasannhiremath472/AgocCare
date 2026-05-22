import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
  { id: 'wholesale',    label: 'Our Wholesale Shop' },
  { id: 'retail',       label: 'Our Retail Shops'   },
  { id: 'our-products', label: 'Our Products'        },
  { id: 'gallery',      label: 'Gallery'             },
  { id: 'board',        label: 'Board Members'       },
  { id: 'contact',      label: 'Contact Us'          },
];

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
      <Helmet><title>About Us | Agoc Care+</title></Helmet>
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
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Agoc Care Pvt. Ltd.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/70 text-base leading-relaxed">
              Empowering Life — Licensed pharma marketing, wholesale & retail since 2016.
            </motion.p>
          </motion.div>

          {/* Quick nav pills */}
          <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible"
            className="flex flex-wrap justify-center gap-3 mt-8">
            {SECTIONS.map(s => (
              <motion.a key={s.id} variants={staggerItem} href={`#${s.id}`}
                onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-4 py-2 bg-white/15 border border-white/30 text-white text-xs font-semibold rounded-lg hover:bg-white/25 transition-colors cursor-pointer">
                {s.label}
              </motion.a>
            ))}
          </motion.div>
        </section>

        {/* ── Wholesale ── */}
        <section id="wholesale" className="section bg-white scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <motion.div className="grid md:grid-cols-2 gap-10 items-center"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              <motion.div variants={fadeLeft}>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Wholesale</p>
                <h2 className="text-3xl font-extrabold text-teal mb-4">Our Wholesale Shop</h2>
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
              <motion.div variants={fadeRight}
                className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col gap-4">
                {[
                  { label:'Wholesale License', value:'20B-618039' },
                  { label:'Drug License', value:'21B-618040' },
                  { label:'GSTIN', value:'27AAOCA4424F1ZQ' },
                  { label:'Established', value:'2016' },
                  { label:'Type', value:'Pharma Marketing & Wholesale' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between border-b border-primary/10 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm font-bold text-teal">{r.label}</span>
                    <span className="text-sm text-gray-600">{r.value}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Retail ── */}
        <section id="retail" className="section bg-teal-light scroll-mt-20">
          <div className="container mx-auto max-w-5xl">
            <motion.div className="grid md:grid-cols-2 gap-10 items-center"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              <motion.div variants={fadeRight} className="md:order-2">
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Retail</p>
                <h2 className="text-3xl font-extrabold text-teal mb-4">Our Retail Shops</h2>
                <p className="text-gray-500 leading-relaxed mb-3">
                  Our retail operations serve individual customers directly through our registered pharmacy outlet. We provide genuine medicines, healthcare products, and personalized guidance from trained staff.
                </p>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Customers can walk in or place orders online through our website for home delivery across India.
                </p>
                <div className="bg-white rounded-2xl p-5 border border-teal-mid/30 space-y-3 text-sm">
                  {[
                    { icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', text:'Palladium Building, Near Pristine Womens Hospital, Assembly Road, Shahupuri, Kolhapur' },
                    { icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text:'Mon–Sat: 9:00 AM – 7:00 PM' },
                    { icon:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', text:'+91 99232 68310' },
                  ].map(r => (
                    <div key={r.text} className="flex gap-3">
                      <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={r.icon}/>
                      </svg>
                      <span className="text-gray-600">{r.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={fadeLeft} className="md:order-1">
                <div className="bg-primary rounded-3xl p-8 text-white text-center">
                  <div className="text-6xl font-extrabold mb-2">2016</div>
                  <div className="text-white/70 text-sm mb-6">Serving since</div>
                  <div className="grid grid-cols-2 gap-4">
                    {[['100%','Genuine Products'],['Pan India','Delivery'],['Licensed','Pharmacy'],['Trusted','Brand']].map(([v,l]) => (
                      <div key={l} className="bg-white/10 rounded-xl p-3">
                        <div className="font-extrabold text-lg">{v}</div>
                        <div className="text-white/70 text-xs">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
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
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Leadership</p>
              <h2 className="text-3xl font-extrabold text-teal">Board Members</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>

              {/* Director 1 — Dadaso Vasant Kadavekar */}
              {[
                { img: 'director1.png', name: 'Dadaso Vasant Kadavekar', initials: 'DK', color: 'bg-primary' },
                { img: 'director2.jpeg', name: 'Ashok Sakharam Surve',    initials: 'AS', color: 'bg-secondary' },
              ].map(d => (
                <motion.div key={d.name} variants={staggerItem}
                  className="bg-white rounded-2xl p-8 border border-teal-mid/30 shadow-card text-center">
                  <div className="w-44 h-44 rounded-full overflow-hidden mx-auto mb-5 border-4 border-primary/20 shadow-lg">
                    <img
                      src={`${import.meta.env.PROD?'':'http://localhost:5000'}/uploads/Directors/${d.img}`}
                      alt={d.name}
                      className="w-full h-full object-cover object-top"
                      onError={e => { e.target.style.display='none'; e.target.parentNode.classList.add('flex','items-center','justify-center',d.color); e.target.parentNode.innerHTML = `<span class="text-white text-3xl font-extrabold">${d.initials}</span>`; }}
                    />
                  </div>
                  <h3 className="text-lg font-extrabold text-teal">{d.name}</h3>
                  <p className="text-secondary font-semibold text-sm mt-1">Director</p>
                  <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                    Director at Agoc Care Private Limited, committed to delivering genuine healthcare products across India.
                  </p>
                </motion.div>
              ))}

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

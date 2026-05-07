import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  motion, AnimatePresence, useScroll, useTransform
} from 'framer-motion';
import { getFeatured, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategorySlider from '../components/CategorySlider';
import {
  fadeUp, fadeIn, fadeLeft, fadeRight, scaleIn,
  staggerContainer, staggerItem, viewport, popIn
} from '../utils/motion';

/* ── static data ─────────────────────────────── */
const OFFERS = [
  { tag:'Limited Deal', title:'Flat 20% off\non Vitamins',     sub:'Use code VITA20 · Ends tonight',          bg:'from-primary to-secondary',    btn:'Shop Vitamins',  to:'/medicines?category=vitamins',       emoji:'💊' },
  { tag:'New Arrivals', title:'Premium\nSkincare Range',       sub:'Dermatologist recommended products',       bg:'from-teal-600 to-primary',     btn:'Explore Now',    to:'/medicines?category=skincare',       emoji:'✨' },
  { tag:'Free Delivery',title:'On Orders\nabove ₹499',         sub:'No coupon needed · Auto applied',         bg:'from-cta to-teal-600',         btn:'Shop Now',       to:'/medicines',                          emoji:'🚚' },
];

const REVIEWS = [
  { name:'Priya Sharma',   city:'Mumbai',    rating:5, text:'Super fast delivery and genuine medicines. The checkout was seamless. Highly recommend Agoc Care!',         avatar:'PS' },
  { name:'Rahul Verma',    city:'Delhi',     rating:5, text:'Best online pharmacy I have used. Got my prescription medicines within 24 hours. Great service!',          avatar:'RV' },
  { name:'Anita Nair',     city:'Bangalore', rating:5, text:'Excellent product quality and pricing. The app is very easy to use. Will definitely order again.',         avatar:'AN' },
  { name:'Suresh Patel',   city:'Ahmedabad', rating:4, text:'Good selection of products. Packaging was secure and medicines were well within expiry.',                  avatar:'SP' },
  { name:'Meena Iyer',     city:'Chennai',   rating:5, text:'Customer support is very responsive. Helped me with a prescription query immediately.',                    avatar:'MI' },
  { name:'Arjun Malhotra', city:'Pune',      rating:5, text:'Prices are much lower than local chemists. Authentic products with proper labelling.',                     avatar:'AM' },
];

const BRANDS = ['Sun Pharma','Cipla','Dr. Reddy\'s','Lupin','Alkem','Dabur','Himalaya','Abbott','Pfizer','Novartis'];

const CATEGORIES_META = {
  tablets:           { icon:'💊', color:'bg-blue-50   text-blue-600'   },
  syrups:            { icon:'🍶', color:'bg-amber-50  text-amber-600'  },
  capsules:          { icon:'💉', color:'bg-purple-50 text-purple-600' },
  injections:        { icon:'🩺', color:'bg-red-50    text-red-600'    },
  vitamins:          { icon:'⚡', color:'bg-yellow-50 text-yellow-600' },
  skincare:          { icon:'🌿', color:'bg-green-50  text-green-600'  },
  'medical-devices': { icon:'🔬', color:'bg-teal-50   text-teal-600'   },
};

const WHY = [
  { icon:'✅', title:'100% Genuine',        sub:'Sourced directly from licensed manufacturers and verified brands.' },
  { icon:'⚡', title:'Fast Delivery',        sub:'Quick dispatch with reliable courier partners across India.' },
  { icon:'🔒', title:'Secure Payments',      sub:'128-bit encrypted checkout via Razorpay. Safe & trusted.' },
  { icon:'📞', title:'Licensed Pharmacists', sub:'Expert support available Mon–Sat, 9 AM to 7 PM.' },
  { icon:'↩️', title:'Easy Returns',         sub:'7-day return for damaged or wrong products delivered.' },
  { icon:'💬', title:'WhatsApp Support',     sub:'Reach us instantly: +91 91589 90002.' },
];

const STATS = [
  { value:'2M+',  label:'Happy Customers' },
  { value:'50K+', label:'Products Listed'  },
  { value:'500+', label:'Brands Available' },
  { value:'99%',  label:'On-Time Delivery' },
];

const HERO_SLIDES = [
  {
    eyebrow:'Pharma Marketing · Wholesale · Retail',
    title:'Your Health,\nDelivered Fast',
    sub:'Genuine medicines & healthcare products at your doorstep. Call us: +91 99232 68310.',
    cta:'Shop Now', ctaTo:'/medicines',
    cta2:'Upload Prescription', cta2To:'/prescription',
    image:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80',
    overlay:'from-primary/90 via-primary/70 to-primary/40',
  },
  {
    eyebrow:'50,000+ Products',
    title:'Vitamins &\nSupplements',
    sub:'Power your immunity with certified vitamins, minerals and nutritional supplements.',
    cta:'Explore Vitamins', ctaTo:'/medicines?category=vitamins',
    cta2:'View All', cta2To:'/medicines',
    image:'https://images.unsplash.com/photo-1550572017-edd951b55104?w=1200&q=80',
    overlay:'from-cta/90 via-cta/70 to-cta/30',
  },
  {
    eyebrow:'Dermatologist Approved',
    title:'Premium\nSkincare Range',
    sub:'Science-backed skincare for every skin type. Shop trusted brands at best prices.',
    cta:'Shop Skincare', ctaTo:'/medicines?category=skincare',
    cta2:'Learn More', cta2To:'/about',
    image:'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&q=80',
    overlay:'from-secondary/90 via-secondary/70 to-secondary/30',
  },
];

const Stars = ({ n }) => Array.from({ length: 5 }, (_, i) => (
  <svg key={i} className={`w-4 h-4 ${i < n ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>
));

export default function Home() {
  const [featured, setFeatured]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState('');
  const [slide, setSlide]           = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getFeatured().then(r => setFeatured(r.data.slice(0, 6))).catch(() => {});
    getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/medicines?search=${encodeURIComponent(search.trim())}`);
  };

  const current = HERO_SLIDES[slide];

  return (
    <>
      <Helmet>
        <title>Agoc Care — Online Pharmacy | Genuine Medicines Delivered Fast</title>
        <meta name="description" content="Buy genuine medicines, vitamins and healthcare products online. Fast delivery, secure payments, 24/7 pharmacist support." />
      </Helmet>

      {/* ══════════════════════════════════════
          HERO — Full-image carousel
      ══════════════════════════════════════ */}
      <section className="relative h-[580px] md:h-[640px] overflow-hidden">
        {/* Background images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={current.image}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${current.overlay}`} />
            {/* bottom fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="container mx-auto px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                className="max-w-3xl mx-auto text-center"
                initial="hidden" animate="visible"
                exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                variants={staggerContainer(0.12, 0)}
              >
                <motion.span variants={popIn}
                  className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5">
                  {current.eyebrow}
                </motion.span>

                <motion.h1 variants={fadeUp}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 whitespace-pre-line drop-shadow-lg">
                  {current.title}
                </motion.h1>

                <motion.p variants={fadeUp}
                  className="text-white/85 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  {current.sub}
                </motion.p>

                {/* Search bar */}
                <motion.form variants={scaleIn} onSubmit={handleSearch}
                  className="flex gap-2 max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-2 mb-7">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
                    </svg>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search medicines, brands..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent text-teal placeholder:text-gray-400 focus:outline-none"/>
                  </div>
                  <motion.button type="submit" whileTap={{ scale: 0.95 }} className="btn-primary px-6 text-sm shrink-0">
                    Search
                  </motion.button>
                </motion.form>

                <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to={current.ctaTo} className="btn-primary px-7 py-3 shadow-2xl">{current.cta}</Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to={current.cta2To}
                      className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/25 transition-all text-sm">
                      {current.cta2}
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {HERO_SLIDES.map((_, i) => (
              <motion.button key={i} onClick={() => setSlide(i)}
                animate={{ width: i === slide ? 32 : 8, backgroundColor: i === slide ? '#ffffff' : 'rgba(255,255,255,0.4)' }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          {/* Prev / Next arrows */}
          <button onClick={() => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/35 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button onClick={() => setSlide(s => (s + 1) % HERO_SLIDES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/35 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <motion.section
        className="bg-primary"
        initial="hidden" whileInView="visible" viewport={viewport}
        variants={staggerContainer(0.1)}
      >
        <div className="container mx-auto px-4 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={staggerItem}>
                <motion.div
                  className="text-2xl md:text-3xl font-extrabold"
                  initial={{ opacity:0, scale:0.5 }}
                  whileInView={{ opacity:1, scale:1 }}
                  transition={{ delay: i * 0.1, type:'spring', stiffness:200, damping:12 }}
                  viewport={{ once:true }}
                >
                  {s.value}
                </motion.div>
                <div className="text-xs text-primary-light mt-0.5 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════
          ABOUT US SNAPSHOT
      ══════════════════════════════════════ */}
      <section className="section bg-white overflow-hidden">
        <div className="container mx-auto">
          <motion.div className="grid md:grid-cols-2 gap-12 items-center"
            variants={staggerContainer(0.12)} initial="hidden" whileInView="visible" viewport={viewport}>

            {/* Image side */}
            <motion.div variants={fadeLeft} className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-card-lg aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&q=80"
                  alt="Agoc Care pharmacy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
              </div>
              {/* Est. badge */}
              <motion.div
                variants={popIn}
                className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-card-lg px-6 py-4 border border-teal-mid/30 text-center"
              >
                <p className="text-3xl font-extrabold text-primary">2016</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Est. Since</p>
              </motion.div>
              {/* Drug license badge */}
              <motion.div
                variants={popIn}
                className="absolute -top-4 -left-4 bg-cta rounded-2xl shadow-card-lg px-4 py-3 text-white text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <p className="text-[10px] font-bold leading-tight">Licensed<br/>Pharmacy</p>
              </motion.div>
            </motion.div>

            {/* Text side */}
            <motion.div variants={fadeRight}>
              <motion.p variants={fadeUp} className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                About Agoc Care
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-teal leading-tight mb-4">
                Empowering Life Through<br/>
                <span className="text-secondary">Genuine Healthcare</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 leading-relaxed mb-4">
                Founded in 2016 by <strong className="text-teal">Satyajeet Kadavekar</strong>, Agoc Care Private Limited is a licensed pharma product marketing, wholesale, and retail company. We are committed to making authentic, affordable healthcare products accessible to every individual across India.
              </motion.p>
              <motion.p variants={fadeUp} className="text-gray-500 leading-relaxed mb-6">
                Based in Kolhapur, Maharashtra, we operate with full drug licensing and GSTIN registration, ensuring every product you receive is genuine, safe, and within its validity.
              </motion.p>

              {/* Key points */}
              <motion.div variants={staggerContainer(0.08)} className="grid grid-cols-2 gap-3 mb-7">
                {[
                  { icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label:'100% Licensed & Genuine' },
                  { icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', label:'Kolhapur, Maharashtra' },
                  { icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label:'Mon–Sat 9 AM – 7 PM' },
                  { icon:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label:'+91 99232 68310' },
                ].map(p => (
                  <motion.div key={p.label} variants={staggerItem}
                    className="flex items-center gap-2.5 bg-teal-light rounded-xl px-3 py-2.5 border border-teal-mid/30">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.icon}/>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-teal">{p.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
                <Link to="/about" className="btn-primary px-6">Learn More About Us</Link>
                <Link to="/medicines" className="btn-outline px-6">Browse Products</Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════ */}
      <section className="section bg-white overflow-hidden">
        <div className="container mx-auto">
          <motion.div className="flex items-end justify-between mb-8"
            initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Browse</p>
              <h2 className="section-hd">Shop by Category</h2>
            </div>
            <Link to="/medicines" className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary hover:gap-3 transition-all">
              View all <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </motion.div>

          {/* Swiper slider */}
          <CategorySlider categories={categories} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          OFFER BANNERS
      ══════════════════════════════════════ */}
      <section id="offers" className="section bg-teal-light">
        <div className="container mx-auto">
          <motion.div className="flex items-end justify-between mb-8"
            initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Deals</p>
              <h2 className="section-hd">Today's Offers</h2>
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-5"
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={staggerContainer(0.12)}
          >
            {OFFERS.map((o, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ scale:1.03, transition:{ duration:0.2 } }}
                whileTap={{ scale:0.98 }}
                onClick={() => navigate(o.to)}
                className={`relative rounded-2xl bg-gradient-to-br ${o.bg} p-7 overflow-hidden cursor-pointer`}
              >
                {/* floating emoji */}
                <motion.div
                  className="absolute -right-3 -top-3 text-8xl select-none pointer-events-none"
                  animate={{ rotate:[0,6,-6,0], y:[0,-4,4,0] }}
                  transition={{ duration:4, repeat:Infinity, ease:'easeInOut', delay: i * 0.5 }}
                  style={{ opacity:0.18 }}
                >
                  {o.emoji}
                </motion.div>
                <span className="badge bg-white/25 text-white border-0 text-xs mb-3">{o.tag}</span>
                <h3 className="text-white font-extrabold text-xl mb-1 leading-snug whitespace-pre-line">{o.title}</h3>
                <p className="text-white/75 text-xs mb-5">{o.sub}</p>
                <motion.div whileHover={{ x:4 }} transition={{ duration:0.15 }}>
                  <Link to={o.to} className="inline-flex items-center gap-1.5 bg-white text-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary-light transition-colors">
                    {o.btn}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════ */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <motion.div className="flex items-end justify-between mb-8"
            initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Top Picks</p>
              <h2 className="section-hd">Featured Products</h2>
              <p className="section-sub">Handpicked by our pharmacists</p>
            </div>
            <Link to="/medicines" className="btn-outline text-sm hidden md:flex">View All →</Link>
          </motion.div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton aspect-square"/>
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-3 w-3/4"/>
                    <div className="skeleton h-3 w-1/2"/>
                    <div className="skeleton h-8 rounded-lg"/>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featured.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div className="text-center mt-8 md:hidden"
            initial="hidden" whileInView="visible" viewport={viewport} variants={fadeIn}>
            <Link to="/medicines" className="btn-outline px-8">View All Products</Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════════════ */}
      <section className="section bg-teal-light">
        <div className="container mx-auto">
          <motion.div className="text-center mb-10"
            initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Why Agoc Care</p>
            <h2 className="section-hd">Healthcare You Can Trust</h2>
            <p className="section-sub max-w-md mx-auto">Committed to making healthcare accessible, affordable and reliable for every Indian.</p>
          </motion.div>

          {/* Continuous marquee slider */}
          <div className="overflow-hidden w-full">
            <div
              className="flex gap-5"
              style={{ animation: 'marquee 40s linear infinite', width: 'max-content' }}
            >
              {[...WHY, ...WHY, ...WHY, ...WHY].map((w, i) => (
                <div
                  key={i}
                  className="flex flex-col items-start gap-3 bg-white rounded-2xl p-6 shadow-card border border-teal-mid/30 cursor-default shrink-0 w-72"
                >
                  <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {w.icon}
                  </div>
                  <h3 className="font-bold text-teal">{w.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{w.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════ */}
      <section className="section bg-white overflow-hidden">
        <div className="container mx-auto">
          <motion.div className="text-center mb-10"
            initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Testimonials</p>
            <h2 className="section-hd">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex gap-0.5"><Stars n={5}/></div>
              <span className="text-sm font-semibold text-teal">4.9</span>
              <span className="text-sm text-gray-400">· 12,400+ reviews</span>
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-4"
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={staggerContainer(0.1)}
          >
            {REVIEWS.map((r, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y:-5, boxShadow:'0 12px 32px rgba(8,145,178,.1)', transition:{ duration:0.2 } }}
                className="card p-5 flex flex-col gap-3"
              >
                <div className="flex gap-0.5"><Stars n={r.rating}/></div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-teal-mid/30">
                  <motion.div
                    className="w-9 h-9 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0"
                    whileHover={{ scale:1.1 }}
                  >
                    {r.avatar}
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-teal">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.city}</p>
                  </div>
                  <svg className="w-6 h-6 text-primary/15 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BRANDS MARQUEE
      ══════════════════════════════════════ */}
      <section className="py-10 bg-teal-light border-y border-teal-mid/40 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.p
            className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6"
            initial="hidden" whileInView="visible" viewport={viewport} variants={fadeIn}
          >
            Trusted Brands We Stock
          </motion.p>
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <motion.div
                key={i}
                whileHover={{ scale:1.08, color:'#0891B2', borderColor:'rgba(8,145,178,0.4)', transition:{ duration:0.15 } }}
                className="shrink-0 px-6 py-3 bg-white rounded-xl border border-teal-mid/40 shadow-card text-sm font-semibold text-gray-500 cursor-default"
              >
                {b}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════ */}
      <motion.section
        className="section bg-primary relative overflow-hidden"
        initial="hidden" whileInView="visible" viewport={viewport}
        variants={fadeIn}
      >
        {/* decorative circles */}
        <motion.div
          className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full pointer-events-none"
          animate={{ scale:[1,1.1,1] }} transition={{ duration:5, repeat:Infinity, ease:'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none"
          animate={{ scale:[1,1.15,1] }} transition={{ duration:7, repeat:Infinity, ease:'easeInOut', delay:1 }}
        />

        <div className="container mx-auto text-center relative z-10">
          <motion.div variants={staggerContainer(0.12)} className="max-w-xl mx-auto">
            <motion.div
              variants={scaleIn}
              className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mb-2">
              Stay Healthy, Stay Updated
            </motion.h2>
            <motion.p variants={fadeUp} className="text-primary-light text-sm mb-7">
              Get exclusive deals, health tips and new arrival alerts in your inbox.
            </motion.p>

            <motion.form
              variants={scaleIn}
              className="flex gap-2 max-w-md mx-auto"
              onSubmit={e => e.preventDefault()}
            >
              <input type="email" placeholder="Enter your email address"
                className="input flex-1 bg-white/15 border-white/25 text-white placeholder:text-white/50 focus:ring-white focus:bg-white/20"/>
              <motion.button
                type="submit"
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
                className="shrink-0 bg-white text-primary font-bold px-6 py-2.5 rounded-lg hover:bg-primary-light transition-colors text-sm"
              >
                Subscribe
              </motion.button>
            </motion.form>
            <motion.p variants={fadeIn} className="text-white/40 text-xs mt-3">
              No spam. Unsubscribe anytime.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}

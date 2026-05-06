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
  { icon:'✅', title:'100% Genuine',   sub:'Sourced directly from licensed manufacturers.' },
  { icon:'⚡', title:'Fast Delivery',  sub:'Same-day dispatch on orders placed before 2 PM.' },
  { icon:'🔒', title:'Secure Payment', sub:'128-bit encrypted checkout via Razorpay.' },
  { icon:'📞', title:'24/7 Support',   sub:'Pharmacists available around the clock.' },
];

const STATS = [
  { value:'2M+',  label:'Happy Customers' },
  { value:'50K+', label:'Products Listed'  },
  { value:'500+', label:'Brands Available' },
  { value:'99%',  label:'On-Time Delivery' },
];

const HERO_SLIDES = [
  {
    eyebrow:'Trusted by 2 Million+ Indians',
    title:'Your Health,\nDelivered Fast',
    sub:'Genuine medicines & healthcare products at your doorstep. Order by 2 PM for same-day dispatch.',
    cta:'Shop Now', ctaTo:'/medicines',
    cta2:'Upload Prescription', cta2To:'/medicines',
    bg:'from-primary/10 via-teal-light to-secondary/10',
    pill:'bg-primary',
  },
  {
    eyebrow:'50,000+ Products',
    title:'Vitamins &\nSupplements',
    sub:'Power your immunity with certified vitamins, minerals and nutritional supplements.',
    cta:'Explore Vitamins', ctaTo:'/medicines?category=vitamins',
    cta2:'View All', cta2To:'/medicines',
    bg:'from-cta/10 via-teal-light to-primary/10',
    pill:'bg-cta',
  },
  {
    eyebrow:'Dermatologist Approved',
    title:'Premium\nSkincare Range',
    sub:'Science-backed skincare for every skin type. Shop trusted brands at best prices.',
    cta:'Shop Skincare', ctaTo:'/medicines?category=skincare',
    cta2:'Learn More', cta2To:'/medicines',
    bg:'from-purple-100 via-teal-light to-primary/10',
    pill:'bg-purple-500',
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
    getFeatured().then(r => setFeatured(r.data)).catch(() => {});
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
          HERO
      ══════════════════════════════════════ */}
      <section className={`bg-gradient-to-br ${current.bg} transition-colors duration-700 overflow-hidden relative`}>
        {/* floating blobs */}
        <motion.div
          className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
          animate={{ scale:[1,1.15,1], opacity:[0.5,0.8,0.5] }}
          transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"
          animate={{ scale:[1,1.2,1], opacity:[0.4,0.7,0.4] }}
          transition={{ duration:8, repeat:Infinity, ease:'easeInOut', delay:1 }}
        />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              className="max-w-3xl mx-auto text-center"
              initial="hidden" animate="visible" exit={{ opacity:0, y:-20, transition:{ duration:0.25 } }}
              variants={staggerContainer(0.12, 0)}
            >
              <motion.span
                variants={popIn}
                className={`inline-block ${current.pill} text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5 shadow-btn`}
              >
                {current.eyebrow}
              </motion.span>

              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-teal leading-tight mb-5 whitespace-pre-line"
              >
                {current.title}
              </motion.h1>

              <motion.p variants={fadeUp} className="text-gray-500 text-base md:text-lg mb-8 max-w-xl mx-auto">
                {current.sub}
              </motion.p>

              {/* Search */}
              <motion.form
                variants={scaleIn}
                onSubmit={handleSearch}
                className="flex gap-2 max-w-lg mx-auto bg-white rounded-2xl shadow-card-lg p-2 mb-8"
              >
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
                  </svg>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search medicines, brands..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent text-teal placeholder:text-gray-400 focus:outline-none"/>
                </div>
                <motion.button type="submit" whileTap={{ scale:0.95 }} className="btn-primary px-6 text-sm">
                  Search
                </motion.button>
              </motion.form>

              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap">
                <motion.div whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                  <Link to={current.ctaTo}  className="btn-primary  px-7 py-3">{current.cta}</Link>
                </motion.div>
                <motion.div whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                  <Link to={current.cta2To} className="btn-outline  px-7 py-3">{current.cta2}</Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots */}
          <div className="flex justify-center gap-2 mt-10">
            {HERO_SLIDES.map((_, i) => (
              <motion.button key={i} onClick={() => setSlide(i)}
                animate={{ width: i === slide ? 28 : 8, backgroundColor: i === slide ? '#0891B2' : '#BAE6FD' }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
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
      <section className="section bg-teal-light">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

          <motion.div
            className="grid sm:grid-cols-2 md:grid-cols-4 gap-5"
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={staggerContainer(0.1)}
          >
            {WHY.map((w, i) => (
              <motion.div
                key={w.title}
                variants={staggerItem}
                whileHover={{ y:-6, boxShadow:'0 16px 40px rgba(8,145,178,.12)', transition:{ duration:0.2 } }}
                className="card p-6 flex flex-col items-start gap-3 cursor-default"
              >
                <motion.div
                  className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-2xl"
                  whileHover={{ scale:1.15, backgroundColor:'#0891B2' }}
                  transition={{ type:'spring', stiffness:300, damping:15 }}
                >
                  {w.icon}
                </motion.div>
                <h3 className="font-bold text-teal">{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.sub}</p>
              </motion.div>
            ))}
          </motion.div>
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

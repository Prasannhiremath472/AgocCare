import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { getCategories } from '../services/api';

const CATEGORIES_ICONS = {
  tablets:           '💊',
  syrups:            '🍶',
  capsules:          '💉',
  injections:        '🩺',
  vitamins:          '⚡',
  skincare:          '🌿',
  'medical-devices': '🔬',
};

export default function Navbar() {
  const [search, setSearch]         = useState('');
  const [menuOpen, setMenuOpen]     = useState(false);
  const [catOpen, setCatOpen]       = useState(false);
  const [userOpen, setUserOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [announce, setAnnounce]     = useState(true);
  const [categories, setCategories] = useState([]);
  const catRef  = useRef(null);
  const userRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuthStore();
  const count = useCartStore(s => s.getCount());

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setMenuOpen(false); setCatOpen(false); setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fn = e => {
      if (catRef.current  && !catRef.current.contains(e.target))  setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/medicines?search=${encodeURIComponent(search.trim())}`);
  };

  const active = path =>
    location.pathname === path
      ? 'text-primary font-semibold'
      : 'text-gray-600 hover:text-primary';

  return (
    <>
      {/* Announcement bar */}
      <AnimatePresence>
        {announce && (
          <motion.div
            key="ann"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-primary text-white text-xs font-medium overflow-hidden"
          >
            <div className="relative flex items-center justify-center py-2 px-8">
              <div className="overflow-hidden w-full max-w-3xl">
                <div className="flex whitespace-nowrap gap-16" style={{ animation: 'marquee 30s linear infinite', width: 'max-content', willChange: 'transform' }}>
                  {[...Array(2)].map((_, k) => (
                    <span key={k} className="flex items-center gap-8 shrink-0">
                      <span>🚚 Free delivery on orders above ₹499</span>
                      <span className="opacity-40">|</span>
                      <span>💊 100% genuine medicines</span>
                      <span className="opacity-40">|</span>
                      <span>🔒 Secure payments via Razorpay</span>
                      <span className="opacity-40">|</span>
                      <span>📞 24/7 Pharmacist support</span>
                      <span className="opacity-40">|</span>
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setAnnounce(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header */}
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 transition-all duration-200
          ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'}
          border-b border-gray-100`}
      >
        <div className="max-w-[1280px] mx-auto px-5 h-[62px] flex items-center gap-5">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center shrink-0">
            <motion.img
              src="/Agoccarelogo.jpeg"
              alt="AgocCare"
              className="h-10 w-auto object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            />
          </Link>

          {/* ── Search ── */}
          <form onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-[380px] items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <svg className="w-4 h-4 text-gray-400 ml-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search medicines..."
              className="flex-1 px-2.5 py-2 text-sm bg-transparent text-teal placeholder:text-gray-400 focus:outline-none min-w-0"/>
            <button type="submit"
              className="shrink-0 text-white text-xs font-bold px-4 py-2.5 transition-all hover:opacity-90"
              style={{ backgroundColor: '#044b99' }}>
              Search
            </button>
          </form>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-2 ml-auto">

            {/* Home — #044b99 */}
            <Link to="/"
              className="text-[13px] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#044b99' }}>
              Home
            </Link>

            {/* About — #079DDF */}
            <Link to="/about"
              className="text-[13px] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#079DDF' }}>
              About
            </Link>

            {/* Products — #044b99 */}
            <div ref={catRef} className="relative">
              <Link to="/medicines"
                className="flex items-center gap-1.5 text-[13px] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#044b99' }}>
                Products
              </Link>

              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2">
                        Shop by Category
                      </p>
                      {categories.map((cat, i) => (
                        <motion.div key={cat.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}>
                          <Link to={`/medicines?category=${cat.slug}`}
                            onClick={() => setCatOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors group">
                            <span className="text-base group-hover:scale-110 transition-transform">
                              {CATEGORIES_ICONS[cat.slug] || '💊'}
                            </span>
                            <span className="font-medium">{cat.name}</span>
                            <svg className="w-3 h-3 ml-auto text-gray-300 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                          </Link>
                        </motion.div>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1 mx-1">
                        <Link to="/medicines" onClick={() => setCatOpen(false)}
                          className="block px-3 py-2 text-xs font-bold text-primary hover:bg-primary-light rounded-xl transition-colors">
                          View all medicines →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Offers — #079DDF */}
            <button onClick={() => { navigate('/'); setTimeout(() => document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              className="text-[13px] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#079DDF' }}>
              Offers
            </button>

            {/* Rx Upload — #044b99 */}
            <Link to="/prescription"
              className="text-[13px] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#044b99' }}>
              Rx Upload
            </Link>

          </nav>

          {/* ── Right actions ── */}
          <div className="hidden lg:flex items-center gap-1 border-l border-gray-100 pl-4 ml-1">

            {/* Cart */}
            <Link to="/cart"
              className="relative p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-cta text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5">
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User */}
            {user ? (
              <div ref={userRef} className="relative">
                <button onClick={() => { setUserOpen(v => !v); setCatOpen(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-[13px] font-semibold text-teal max-w-[72px] truncate hidden xl:block">
                    {user.name?.split(' ')[0]}
                  </span>
                  <motion.svg animate={{ rotate: userOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                    className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-teal-light">
                        <p className="text-[13px] font-bold text-teal truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Admin Panel
                          </Link>
                        )}
                        <Link to="/orders" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                          My Orders
                        </Link>
                        <Link to="/cart" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                          Cart
                          {count > 0 && (
                            <span className="ml-auto text-[10px] font-bold bg-cta text-white px-1.5 py-0.5 rounded-full">
                              {count}
                            </span>
                          )}
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={() => { logout(); navigate('/'); setUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="text-[13px] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#079DDF' }}>
                  Login
                </Link>
                <Link to="/register"
                  className="text-[13px] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#044b99' }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + burger */}
          <div className="flex items-center gap-2 ml-auto lg:hidden">
            <Link to="/cart" className="relative p-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {count > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-4 bg-cta text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5">
                  {count}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(v => !v)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <motion.svg animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}
                className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}/>
              </motion.svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search medicines..." className="input text-sm"/>
                  <button type="submit" className="btn-primary text-sm px-4">Go</button>
                </form>

                <nav className="space-y-0.5">
                  {[
                    { to:'/',             label:'Home'                              },
                    { to:'/about',        label:'About Us'                          },
                    { to:'/medicines',    label:'All Medicines'                     },
                    { to:'/prescription', label:'Rx Upload'                         },
                    { to:'/cart',         label:`Cart${count > 0 ? ` (${count})` : ''}` },
                  ].map(l => (
                    <Link key={l.to} to={l.to}
                      className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  ))}

                  {/* Categories accordion */}
                  <button onClick={() => setCatOpen(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Categories
                    <motion.svg animate={{ rotate: catOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                      className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {catOpen && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                        exit={{ opacity:0, height:0 }} className="pl-3 overflow-hidden">
                        {categories.map(cat => (
                          <Link key={cat.id} to={`/medicines?category=${cat.slug}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-primary hover:bg-primary-light transition-colors">
                            {CATEGORIES_ICONS[cat.slug] || '💊'} {cat.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </nav>

                <div className="border-t border-gray-100 pt-3">
                  {user ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-black flex items-center justify-center">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-teal">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block px-3 py-2 rounded-xl text-sm text-primary hover:bg-primary-light transition-colors">
                          ⚙️ Admin Panel
                        </Link>
                      )}
                      <Link to="/orders" className="block px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        My Orders
                      </Link>
                      <button onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link to="/login"    className="btn-outline text-sm flex-1 justify-center">Login</Link>
                      <Link to="/register" className="btn-primary text-sm flex-1 justify-center">Sign Up</Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

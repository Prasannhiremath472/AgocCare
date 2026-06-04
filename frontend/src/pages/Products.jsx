import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { fadeUp, viewport } from '../utils/motion';

// ── Module-level cache (persists across re-renders, cleared on page refresh) ──
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (params) => JSON.stringify(params);

const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
};

const setToCache = (key, data) => {
  cache.set(key, { data, time: Date.now() });
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData]               = useState({ products: [], total: 0, pages: 1 });
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef(null);

  const page     = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const sort     = searchParams.get('sort')      || '';

  const fetchProducts = useCallback(async () => {
    const params = { page, limit: 12, category, search, sort };
    const key    = getCacheKey(params);

    // ── Instant cache hit — show immediately, no skeleton ──
    const cached = getFromCache(key);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(false);
      // Silently refresh in background
      getProducts(params)
        .then(r => { setToCache(key, r.data); setData(r.data); })
        .catch(() => {});
      return;
    }

    // ── No cache — show skeleton, fetch ──
    setLoading(true);
    setError(false);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: res } = await getProducts(params, { signal: controller.signal });
      setToCache(key, res);
      setData(res);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, category, search, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Pre-fetch all categories on mount so switching is instant
  useEffect(() => {
    getCategories().then(r => {
      setCategories(r.data);
      // Pre-warm cache for each category
      r.data.forEach(cat => {
        const params = { page: 1, limit: 12, category: cat.slug, search: '', sort: '' };
        const key = getCacheKey(params);
        if (!getFromCache(key)) {
          getProducts(params).then(res => setToCache(key, res.data)).catch(() => {});
        }
      });
      // Pre-warm "All" as well
      const allKey = getCacheKey({ page: 1, limit: 12, category: '', search: '', sort: '' });
      if (!getFromCache(allKey)) {
        getProducts({ page: 1, limit: 12, category: '', search: '', sort: '' })
          .then(res => setToCache(allKey, res.data)).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    val ? p.set(key, val) : p.delete(key);
    p.delete('page');
    setSearchParams(p);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-teal uppercase tracking-widest mb-3">Categories</h3>
        <ul className="space-y-1">
          {[{ id: 'all', name: 'All Products', slug: '' }, ...categories].map(cat => (
            <motion.li key={cat.id} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
              <button
                onClick={() => setParam('category', cat.slug)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all
                  ${(!category && !cat.slug) || category === cat.slug
                    ? 'bg-primary text-white font-semibold'
                    : 'text-gray-600 hover:bg-teal-mid'}`}
              >
                {cat.name}
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="border-t border-teal-mid/40"/>
      <div>
        <h3 className="text-xs font-bold text-teal uppercase tracking-widest mb-3">Sort By</h3>
        <ul className="space-y-1">
          {[['', 'Latest First'], ['price_asc', 'Price: Low → High'], ['price_desc', 'Price: High → Low'], ['name', 'Name A–Z']].map(([val, label]) => (
            <motion.li key={val} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
              <button
                onClick={() => setParam('sort', val)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all
                  ${sort === val ? 'bg-primary text-white font-semibold' : 'text-gray-600 hover:bg-teal-mid'}`}
              >
                {label}
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <SeoHead
        pageKey="products"
        defaults={{ title: 'Buy Medicines Online – AgocCare', description: 'Browse 1000+ genuine medicines, vitamins and healthcare products at best prices.' }}
        overrides={{ title: `${search ? `"${search}" — ` : category ? `${category} — ` : ''}Medicines | AgocCare` }}
      />

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-teal-mid/40 py-3 px-4"
      >
        <div className="container mx-auto flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-teal font-medium capitalize">{category || search || 'All Medicines'}</span>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block w-52 shrink-0"
          >
            <div className="card p-5 sticky top-24">
              <SidebarContent/>
            </div>
          </motion.aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-5 gap-3 flex-wrap"
            >
              <div>
                <h1 className="text-lg font-bold text-teal capitalize">
                  {search ? `Results for "${search}"` : category ? category : 'All Medicines'}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {loading && !data.products.length ? 'Loading…' : `${data.total} products found`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setSidebarOpen(true)} whileTap={{ scale: 0.95 }}
                  className="md:hidden btn-outline text-xs px-3 py-2 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                  </svg>
                  Filter
                </motion.button>
                <select value={sort} onChange={e => setParam('sort', e.target.value)}
                  className="input w-auto text-sm py-2 hidden md:block">
                  <option value="">Latest</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </motion.div>

            {/* Grid */}
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div key="error"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 card p-10"
                >
                  <div className="text-5xl mb-4">⚠️</div>
                  <h3 className="text-lg font-bold text-teal mb-2">Could not load products</h3>
                  <p className="text-gray-400 text-sm mb-6">The server may be offline. Please try again.</p>
                  <button onClick={fetchProducts} className="btn-primary px-8">Retry</button>
                </motion.div>

              ) : loading && !data.products.length ? (
                /* Skeleton — only shown on FIRST load, not on category switch */
                <motion.div key="skeleton"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                >
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
                </motion.div>

              ) : data.products.length === 0 ? (
                <motion.div key="empty"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24"
                >
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
                    className="text-6xl mb-4">🔍</motion.div>
                  <h3 className="text-lg font-semibold text-teal mb-1">No products found</h3>
                  <p className="text-gray-400 text-sm mb-6">Try a different search term or category.</p>
                  <button onClick={() => setSearchParams({})} className="btn-primary">Clear filters</button>
                </motion.div>

              ) : (
                <motion.div
                  key={`grid-${category}-${search}-${sort}-${page}`}
                  className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                  initial="hidden" animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                  {data.products.map((p, i) => (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ProductCard product={p}/>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <Pagination page={page} pages={data.pages} onChange={p => {
              const params = new URLSearchParams(searchParams);
              params.set('page', p);
              setSearchParams(params);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}/>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div key="drawer" className="fixed inset-0 z-50 flex md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}/>
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative ml-auto w-72 bg-white h-full p-5 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-teal">Filters</h2>
                <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <SidebarContent/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

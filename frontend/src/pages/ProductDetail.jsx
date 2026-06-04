import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { formatPrice, discount, imgUrl, galleryUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct]     = useState(null);
  const [qty, setQty]             = useState(1);
  const [loading, setLoading]     = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [expanded, setExpanded]   = useState(false);
  const [zoomed, setZoomed]       = useState(false);
  const [zoomPos, setZoomPos]     = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox]   = useState(false);
  const [lbScale, setLbScale]     = useState(1);
  const imgRef = useRef(null);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setExpanded(false);
    getProduct(slug)
      .then(r => { setProduct(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-teal mb-3">Product not found</h2>
      <Link to="/medicines" className="btn-primary">Browse all medicines</Link>
    </div>
  );

  const disc   = discount(product.price, product.mrp);

  const handleMouseMove = e => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const images = product.images?.length
    ? product.images.map(p => galleryUrl(p))
    : [imgUrl(product.image)];

  // Split description: first 3 lines preview, rest expandable
  const descLines = product.description?.split('\n') || [];
  const previewLines = descLines.slice(0, 3).join('\n');
  const hasMore = descLines.length > 3;

  return (
    <>
      <SeoHead
        pageKey="product_detail"
        defaults={{ title: `${product.name} | AgocCare`, description: product.description || `Buy ${product.name} online at best price. Fast delivery across India.` }}
        overrides={{
          title: `${product.name} | AgocCare`,
          description: product.description || `Buy ${product.name} online at best price. Fast delivery across India.`,
          keywords: `${product.name}, ${product.composition || ''}, buy online, medicine`,
          og_image: product.image?.startsWith('data:') ? '' : product.image || '',
        }}
      />

      <div className="bg-teal-light min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1 flex-wrap">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>›</span>
            <Link to="/medicines" className="hover:text-primary">Medicines</Link>
            <span>›</span>
            <Link to={`/medicines?category=${product.category_slug}`} className="hover:text-primary">{product.category}</Link>
            <span>›</span>
            <span className="text-teal font-medium">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8">

            {/* ── Left: Image Gallery ── */}
            <div className="flex flex-col gap-3">
              <div
                ref={imgRef}
                className="bg-white rounded-2xl border border-teal-mid/30 shadow-card overflow-hidden aspect-square flex items-center justify-center relative cursor-crosshair"
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={images[activeImg]}
                    alt={product.name}
                    className="max-h-[420px] max-w-full object-contain p-6 select-none"
                    style={zoomed ? {
                      transform: 'scale(2.5)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transition: 'transform-origin 0s',
                    } : { transform: 'scale(1)', transition: 'transform 0.2s ease' }}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onError={e => { e.target.src = '/placeholder.webp'; }}
                    draggable={false}
                  />
                </AnimatePresence>

                {/* Fullscreen button */}
                <button onClick={() => { setLightbox(true); setLbScale(1); }}
                  className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-xl flex items-center justify-center transition-colors"
                  title="Click to zoom / fullscreen">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                  </svg>
                </button>

                {/* Zoom hint */}
                {!zoomed && (
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 pointer-events-none">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                    </svg>
                    Hover to zoom · Click ⛶ for fullscreen
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors z-10">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors z-10">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </>
                )}
                {disc > 0 && (
                  <span className="absolute top-3 left-3 bg-cta text-white text-xs font-bold px-2.5 py-1 rounded-lg z-10">
                    {disc}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <motion.button key={i} onClick={() => setActiveImg(i)}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white flex items-center justify-center transition-all
                        ${activeImg === i ? 'border-primary shadow-btn' : 'border-gray-200 hover:border-primary/50'}`}>
                      <img src={img} alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-contain p-1"
                        onError={e => { e.target.src = '/placeholder.webp'; }}/>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Info ── */}
            <div className="flex flex-col gap-4">
              {!!product.prescription_required && (
                <span className="badge-rx self-start">Prescription Required (Rx)</span>
              )}

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-teal leading-tight">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {product.category}{product.manufacturer ? ` · ${product.manufacturer}` : ''}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-teal">{formatPrice(product.price)}</span>
                {disc > 0 && (
                  <>
                    <span className="text-gray-400 line-through text-lg">{formatPrice(product.mrp)}</span>
                    <span className="bg-cta-light text-cta-dark text-sm px-2.5 py-0.5 rounded-lg font-bold">{disc}% OFF</span>
                  </>
                )}
              </div>

              {/* Stock */}
              <p className={`text-sm font-semibold flex items-center gap-1.5 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}/>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </p>

              {/* ── Description with expand/collapse ── */}
              {product.description && (
                <div className="bg-white rounded-2xl border border-teal-mid/30 p-4">
                  <h3 className="text-sm font-extrabold text-teal mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Product Description
                  </h3>
                  <AnimatePresence initial={false}>
                    <motion.p
                      className="text-gray-600 text-sm leading-relaxed whitespace-pre-line"
                      animate={{ height: 'auto' }}
                    >
                      {expanded ? product.description : previewLines}
                      {!expanded && hasMore && '...'}
                    </motion.p>
                  </AnimatePresence>
                  {hasMore && (
                    <button
                      onClick={() => setExpanded(v => !v)}
                      className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      {expanded ? 'Show Less ▲' : 'Read More ▼'}
                    </button>
                  )}
                </div>
              )}

              {/* Product details */}
              <div className="bg-white rounded-2xl border border-teal-mid/30 p-4 space-y-2.5 text-sm">
                {product.composition && (
                  <div className="flex gap-2">
                    <span className="font-bold text-teal w-32 shrink-0">Composition</span>
                    <span className="text-gray-600">{product.composition}</span>
                  </div>
                )}
                {product.manufacturer && (
                  <div className="flex gap-2">
                    <span className="font-bold text-teal w-32 shrink-0">Manufacturer</span>
                    <span className="text-gray-600">{product.manufacturer}</span>
                  </div>
                )}
                {product.expiry_date && (
                  <div className="flex gap-2">
                    <span className="font-bold text-teal w-32 shrink-0">Expiry</span>
                    <span className="text-gray-600">{new Date(product.expiry_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-bold text-teal w-32 shrink-0">Category</span>
                  <span className="text-gray-600">{product.category}</span>
                </div>
              </div>

              {/* Qty + Add to Cart — at the bottom */}
              {product.stock > 0 && (
                <div className="flex items-center gap-3 mt-auto">
                  <div className="flex items-center border-2 border-teal-mid rounded-xl overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="px-4 py-2.5 hover:bg-teal-light font-bold text-teal transition-colors text-lg">−</button>
                    <span className="px-5 py-2.5 font-bold text-teal border-x-2 border-teal-mid">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="px-4 py-2.5 hover:bg-teal-light font-bold text-teal transition-colors text-lg">+</button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { addItem(product, qty); toast.success(`${product.name} added to cart!`); }}
                    className="btn-primary flex-1 py-3 text-base">
                    + Add to Cart
                  </motion.button>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: '100% Genuine' },
                  { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Safe Delivery' },
                  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Secure Payment' },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center gap-1.5 bg-teal-light rounded-xl p-3 text-center border border-teal-mid/30">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.icon}/>
                    </svg>
                    <span className="text-[10px] font-bold text-teal">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Lightbox with zoom ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={() => setLightbox(false)}>

            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
              <p className="text-white text-sm font-semibold truncate max-w-xs">{product.name}</p>
              <div className="flex items-center gap-2">
                {/* Zoom out */}
                <button onClick={() => setLbScale(s => Math.max(1, +(s - 0.5).toFixed(1)))}
                  className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center text-white transition-colors text-lg font-bold">
                  −
                </button>
                {/* Scale indicator */}
                <span className="text-white text-xs font-bold w-12 text-center">{Math.round(lbScale * 100)}%</span>
                {/* Zoom in */}
                <button onClick={() => setLbScale(s => Math.min(5, +(s + 0.5).toFixed(1)))}
                  className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center text-white transition-colors text-lg font-bold">
                  +
                </button>
                {/* Reset */}
                <button onClick={() => setLbScale(1)}
                  className="px-3 h-9 bg-white/15 hover:bg-white/25 rounded-xl text-white text-xs font-bold transition-colors">
                  Reset
                </button>
                {/* Close */}
                <button onClick={() => setLightbox(false)}
                  className="w-9 h-9 bg-red-500/80 hover:bg-red-500 rounded-xl flex items-center justify-center text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Image area — scrollable when zoomed */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}>
              <motion.img
                src={images[activeImg]}
                alt={product.name}
                animate={{ scale: lbScale }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="max-w-full max-h-full object-contain select-none"
                style={{ transformOrigin: 'center center', cursor: lbScale > 1 ? 'grab' : 'zoom-in' }}
                onClick={() => setLbScale(s => s < 3 ? +(s + 0.5).toFixed(1) : 1)}
                onError={e => { e.target.src = '/placeholder.webp'; }}
                draggable={false}
              />
            </div>

            {/* Bottom thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => { setActiveImg(i); setLbScale(1); }}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-white' : 'border-white/30 opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt={i} className="w-full h-full object-contain bg-white p-1"
                      onError={e => { e.target.src = '/placeholder.webp'; }}/>
                  </button>
                ))}
              </div>
            )}

            {/* Hint */}
            <p className="text-white/40 text-xs text-center pb-3 shrink-0">
              Click image to zoom · Use + / − buttons · Click outside to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { formatPrice, discount, imgUrl, galleryUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug }   = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty]         = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
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
  // Use gallery images if available, fallback to single image
  const images = product.images?.length
    ? product.images.map(p => galleryUrl(p))
    : [imgUrl(product.image)];

  return (
    <>
      <Helmet>
        <title>{product.name} | Agoc Care</title>
        <meta name="description" content={product.description || `Buy ${product.name} online at best price.`} />
      </Helmet>

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

            {/* ── Image Gallery ── */}
            <div className="flex flex-col gap-3">
              {/* Main image */}
              <div className="bg-white rounded-2xl border border-teal-mid/30 shadow-card overflow-hidden aspect-square flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={images[activeImg]}
                    alt={product.name}
                    className="max-h-[420px] max-w-full object-contain p-6"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    onError={e => { e.target.src = '/placeholder.webp'; }}
                  />
                </AnimatePresence>

                {/* Prev/Next arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </>
                )}

                {/* Discount badge */}
                {disc > 0 && (
                  <span className="absolute top-3 left-3 bg-cta text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    {disc}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white flex items-center justify-center transition-all
                        ${activeImg === i ? 'border-primary shadow-btn' : 'border-gray-200 hover:border-primary/50'}`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-contain p-1"
                        onError={e => { e.target.src = '/placeholder.webp'; }}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div className="flex flex-col gap-4">
              {product.prescription_required && (
                <span className="badge-rx self-start">Prescription Required (Rx)</span>
              )}

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-teal leading-tight">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {product.category}
                  {product.manufacturer ? ` · ${product.manufacturer}` : ''}
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
              <p className={`text-sm font-semibold flex items-center gap-1.5
                ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}/>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </p>

              {/* Qty + Add to cart */}
              {product.stock > 0 && (
                <div className="flex items-center gap-3">
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
                    className="btn-primary flex-1 py-3 text-base"
                  >
                    + Add to Cart
                  </motion.button>
                </div>
              )}

              {/* Product details */}
              <div className="bg-white rounded-2xl border border-teal-mid/30 p-4 space-y-3 text-sm">
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

          {/* Description */}
          {product.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-teal-mid/30 shadow-card p-6 mt-8"
            >
              <h2 className="text-lg font-extrabold text-teal mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Product Description
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{product.description}</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

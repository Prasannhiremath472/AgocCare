import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { formatPrice, discount, imgUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addItem    = useCartStore(s => s.addItem);
  const disc       = discount(product.price, product.mrp);
  const outOfStock = product.stock === 0;
  const [added, setAdded] = useState(false);

  const handleAdd = e => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`, { icon: '💊' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(4,75,153,.13)', transition: { duration: 0.2 } }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col group"
    >
      {/* ── Image block ── */}
      <Link to={`/medicines/${product.slug}`} className="relative block bg-white overflow-hidden">

        {/* Top-left badge */}
        <div className="absolute top-2 left-2 z-10">
          {product.prescription_required ? (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Rx</span>
          ) : outOfStock ? (
            <span className="bg-gray-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Out of Stock</span>
          ) : disc > 0 ? null : (
            <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Genuine</span>
          )}
        </div>

        {/* Wishlist heart — appears on hover */}
        <motion.button
          onClick={e => e.preventDefault()}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <svg className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </motion.button>

        {/* Product image */}
        <motion.img
          src={imgUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className="w-full aspect-[4/3] object-contain p-3"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onError={e => { e.target.src = '/placeholder.webp'; }}
        />

        {/* Bottom discount strip */}
        {disc > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-cta flex items-center justify-between px-2.5 py-1">
            <span className="text-white text-[10px] font-bold">{disc}% OFF</span>
            <div className="flex items-center gap-0.5">
              <svg className="w-3 h-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-white text-[10px] font-bold">4.8</span>
            </div>
          </div>
        )}
      </Link>

      {/* ── Info block ── */}
      <div className="flex flex-col flex-1 p-2.5 gap-1">
        <p className="text-[9px] font-bold text-secondary uppercase tracking-wider">{product.category}</p>

        <Link to={`/medicines/${product.slug}`}>
          <h3 className="text-xs font-bold text-teal leading-snug line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-sm font-extrabold text-teal">{formatPrice(product.price)}</span>
          {disc > 0 && (
            <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>

        {/* Add to cart */}
        <motion.button
          onClick={handleAdd}
          disabled={outOfStock}
          whileHover={outOfStock ? {} : { scale: 1.02 }}
          whileTap={outOfStock ? {} : { scale: 0.97 }}
          className={`mt-1 w-full py-1.5 rounded-lg text-xs font-bold transition-colors duration-150
            ${outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark'
            }`}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span key="added"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Added!
              </motion.span>
            ) : (
              <motion.span key="add"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                {outOfStock ? 'Out of Stock' : '+ Add to Cart'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}

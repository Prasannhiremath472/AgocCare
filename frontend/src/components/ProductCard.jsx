import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { formatPrice, discount, imgUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addItem   = useCartStore(s => s.addItem);
  const disc      = discount(product.price, product.mrp);
  const outOfStock = product.stock === 0;
  const [added, setAdded] = useState(false);

  const handleAdd = e => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`, { icon:'💊' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      whileHover={{ y:-6, boxShadow:'0 16px 40px rgba(8,145,178,.13)', transition:{ duration:0.22 } }}
      transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
      className="card flex flex-col bg-white"
    >
      {/* Image */}
      <Link to={`/medicines/${product.slug}`} className="relative block bg-teal-light rounded-t-xl overflow-hidden aspect-square">
        <motion.img
          src={imgUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4"
          whileHover={{ scale:1.08 }}
          transition={{ duration:0.35, ease:'easeOut' }}
          onError={e => { e.target.src = '/placeholder.webp'; }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {disc > 0 && (
            <motion.span
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.15 }}
              className="badge-off"
            >
              {disc}% OFF
            </motion.span>
          )}
          {product.prescription_required && (
            <motion.span
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.2 }}
              className="badge-rx"
            >
              Rx
            </motion.span>
          )}
          {outOfStock && <span className="badge-oos">Out of Stock</span>}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">{product.category}</p>

        <Link to={`/medicines/${product.slug}`} className="flex-1">
          <h3 className="text-sm font-semibold text-teal leading-snug line-clamp-2 hover:text-primary transition-colors duration-150">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-teal">{formatPrice(product.price)}</span>
          {disc > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(product.mrp)}</span>}
        </div>

        {/* Add to cart button */}
        <motion.button
          onClick={handleAdd}
          disabled={outOfStock}
          whileHover={outOfStock ? {} : { scale:1.03 }}
          whileTap={outOfStock   ? {} : { scale:0.96 }}
          className={`relative w-full py-2 rounded-lg text-sm font-semibold overflow-hidden transition-colors duration-150
            ${outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark shadow-btn'
            }`}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-8 }}
                className="flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Added!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-8 }}
              >
                {outOfStock ? 'Out of Stock' : '+ Add to Cart'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}

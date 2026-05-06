import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { formatPrice, imgUrl } from '../utils/helpers';
import { staggerContainer, staggerItem, fadeUp, fadeIn, scaleIn, viewport } from '../utils/motion';

export default function Cart() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) { setHydrated(true); return; }
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  const items      = useCartStore(s => s.items);
  const removeItem = useCartStore(s => s.removeItem);
  const updateQty  = useCartStore(s => s.updateQty);
  const clearCart  = useCartStore(s => s.clearCart);
  const getTotal   = useCartStore(s => s.getTotal);
  const navigate   = useNavigate();

  if (!hydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate:360 }}
          transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
          className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-teal-light">
        <Helmet><title>Cart | Agoc Care</title></Helmet>
        <motion.div
          initial={{ opacity:0, scale:0.5 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ type:'spring', stiffness:200, damping:15 }}
          className="w-28 h-28 bg-primary-light rounded-full flex items-center justify-center mb-7"
        >
          <motion.svg
            className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            animate={{ y:[0,-4,0] }} transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </motion.svg>
        </motion.div>
        <motion.h2
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="text-2xl font-bold text-teal mb-2"
        >
          Your cart is empty
        </motion.h2>
        <motion.p
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="text-gray-400 mb-7 max-w-xs"
        >
          Looks like you haven't added any medicines yet.
        </motion.p>
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
        >
          <Link to="/medicines" className="btn-primary px-8 py-3">Browse Medicines</Link>
        </motion.div>
      </div>
    );
  }

  const deliveryFee = getTotal() >= 499 ? 0 : 49;
  const grandTotal  = getTotal() + deliveryFee;
  const savings = items.reduce((s, i) => s + (Number(i.mrp || i.price) - Number(i.price)) * i.qty, 0);

  return (
    <>
      <Helmet><title>{`Cart (${items.length}) | Agoc Care`}</title></Helmet>
      <div className="bg-teal-light min-h-screen py-8">
        <div className="container mx-auto px-4">

          <motion.h1
            initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
            className="text-2xl font-bold text-teal mb-6"
          >
            Shopping Cart{' '}
            <span className="text-sm font-normal text-gray-400">
              ({items.length} item{items.length !== 1 ? 's' : ''})
            </span>
          </motion.h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <motion.div
              className="lg:col-span-2 space-y-3"
              variants={staggerContainer(0.08)}
              initial="hidden" animate="visible"
            >
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.product_id}
                    variants={staggerItem}
                    exit={{ opacity:0, x:-60, height:0, marginBottom:0, transition:{ duration:0.3 } }}
                    layout
                    className="card p-4 flex gap-4 items-center"
                  >
                    <Link to={`/medicines/${item.slug}`}
                      className="w-20 h-20 rounded-xl bg-teal-light flex items-center justify-center shrink-0 overflow-hidden border border-teal-mid/30">
                      <motion.img
                        src={imgUrl(item.image)} alt={item.name}
                        className="w-full h-full object-contain p-2"
                        whileHover={{ scale:1.08 }}
                        onError={e => { e.target.src = '/placeholder.webp'; }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/medicines/${item.slug}`}
                        className="text-sm font-semibold text-teal hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-base font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <motion.button
                        onClick={() => removeItem(item.product_id)}
                        whileHover={{ scale:1.2, color:'#f87171' }}
                        whileTap={{ scale:0.9 }}
                        className="text-gray-300 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </motion.button>

                      <div className="flex items-center border border-teal-mid/50 rounded-lg overflow-hidden bg-white">
                        <motion.button whileTap={{ scale:0.85 }}
                          onClick={() => updateQty(item.product_id, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-teal-light font-bold text-teal transition-colors">
                          −
                        </motion.button>
                        <motion.span
                          key={item.qty}
                          initial={{ scale:0.6, opacity:0 }} animate={{ scale:1, opacity:1 }}
                          className="w-9 text-center text-sm font-semibold text-teal"
                        >
                          {item.qty}
                        </motion.span>
                        <motion.button whileTap={{ scale:0.85 }}
                          onClick={() => updateQty(item.product_id, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-teal-light font-bold text-teal transition-colors">
                          +
                        </motion.button>
                      </div>

                      <p className="text-xs font-bold text-teal">{formatPrice(Number(item.price) * item.qty)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                onClick={clearCart}
                whileHover={{ x:4 }} whileTap={{ scale:0.95 }}
                className="text-xs text-red-400 hover:text-red-600 hover:underline transition-colors"
              >
                Clear entire cart
              </motion.button>
            </motion.div>

            {/* Summary */}
            <motion.div
              className="space-y-4"
              initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.45, delay:0.2, ease:[0.22,1,0.36,1] }}
            >
              <div className="card p-5">
                <h2 className="font-bold text-teal text-lg mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  {items.map(i => (
                    <div key={i.product_id} className="flex justify-between text-gray-600">
                      <span className="truncate max-w-[60%]">{i.name} <span className="text-gray-400">×{i.qty}</span></span>
                      <span className="font-medium text-teal">{formatPrice(Number(i.price) * i.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-teal-mid/40 my-3"/>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-teal">{formatPrice(getTotal())}</span>
                  </div>
                  {savings > 0 && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="flex justify-between text-cta">
                      <span>Savings</span>
                      <span className="font-semibold">−{formatPrice(savings)}</span>
                    </motion.div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <motion.span
                      key={deliveryFee}
                      initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
                      className={deliveryFee === 0 ? 'text-cta font-semibold' : 'font-medium text-teal'}
                    >
                      {deliveryFee === 0 ? 'FREE 🎉' : formatPrice(deliveryFee)}
                    </motion.span>
                  </div>
                </div>

                <div className="border-t border-teal-mid/40 my-3"/>
                <div className="flex justify-between font-bold text-lg text-teal">
                  <span>Total</span>
                  <motion.span
                    key={grandTotal}
                    initial={{ scale:0.85 }} animate={{ scale:1 }}
                    transition={{ type:'spring', stiffness:300, damping:15 }}
                    className="text-primary"
                  >
                    {formatPrice(grandTotal)}
                  </motion.span>
                </div>

                {deliveryFee > 0 && (
                  <motion.p
                    initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                    className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3"
                  >
                    Add ₹{(499 - getTotal()).toFixed(0)} more for FREE delivery!
                  </motion.p>
                )}

                <motion.button
                  onClick={() => navigate('/checkout')}
                  whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="btn-primary w-full py-3 mt-4 text-sm"
                >
                  Proceed to Checkout →
                </motion.button>
                <Link to="/medicines" className="btn-ghost w-full justify-center mt-2 text-sm">
                  ← Continue Shopping
                </Link>
              </div>

              {/* Trust badges */}
              <motion.div
                className="card p-4 grid grid-cols-3 gap-3 text-center"
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
              >
                {[['🔒','Secure','Payment'],['✅','Genuine','Medicines'],['🚚','Fast','Delivery']].map(([icon,l1,l2],i) => (
                  <motion.div key={l1} whileHover={{ scale:1.05 }}>
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-[10px] text-gray-400 font-medium leading-tight">{l1}<br/>{l2}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createOrder, createPaymentOrder, verifyPayment } from '../services/api';
import { formatPrice } from '../utils/helpers';
import { staggerContainer, staggerItem, fadeUp } from '../utils/motion';
import toast from 'react-hot-toast';

export default function Checkout() {
  const items    = useCartStore(s => s.items);
  const getTotal = useCartStore(s => s.getTotal);
  const clearCart = useCartStore(s => s.clearCart);
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '', phone: '', street: '', city: '', state: '', pincode: ''
  });

  const handleChange = e => setAddress(a => ({ ...a, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Cart is empty');

    // Guard: Razorpay script must be loaded
    if (typeof window.Razorpay === 'undefined') {
      toast.error('Payment gateway not loaded. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create order in DB
      const fee = getTotal() >= 499 ? 0 : 49;
      const { data: order } = await createOrder({
        items: items.map(i => ({ product_id: i.product_id, qty: i.qty })),
        shipping_address: JSON.stringify(address),
        delivery_fee: fee,
      });

      // Step 2: Create Razorpay order
      const { data: rzp } = await createPaymentOrder({ order_id: order.order_id });

      // Step 3: Open Razorpay checkout modal
      const options = {
        key:         rzp.key_id,
        amount:      rzp.amount,
        currency:    rzp.currency,
        name:        'Agoc Care',
        description: 'Medicine Order',
        image:       `${import.meta.env.PROD ? '' : 'http://localhost:5000'}/Agoccarelogo.jpeg`,
        order_id:    rzp.order_id,
        prefill: {
          name:    address.name,
          contact: address.phone,
          email:   user?.email || '',
          method:  'upi',              // pre-select UPI tab
        },
        config: {
          display: {
            blocks: {
              banks: {
                name:        'Pay via UPI / Cards / Netbanking',
                instruments: [
                  { method: 'upi'         },
                  { method: 'card'        },
                  { method: 'netbanking'  },
                  { method: 'wallet'      },
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: { show_default_blocks: true },
          },
        },
        theme: { color: '#044b99', hide_topbar: false },
        handler: async response => {
          // Step 4: Verify signature on backend — NEVER trust frontend
          try {
            const { data: verified } = await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              order_id:            order.order_id,
            });
            clearCart();
            toast.success('Payment successful! 🎉');
            navigate(`/orders/${verified.order_id}`);
          } catch (err) {
            console.error('Verify error:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Payment verification failed. Contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', err => {
        console.error('Razorpay payment failed:', err.error);
        toast.error(`Payment failed: ${err.error.description}`);
        setLoading(false);
      });
      rzpInstance.open();

    } catch (err) {
      console.error('Checkout error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  const deliveryFee = getTotal() >= 499 ? 0 : 49;

  return (
    <>
      <Helmet><title>Checkout | Agoc Care</title></Helmet>

      <div className="bg-teal-light min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
            <span>›</span>
            <span className="text-teal font-semibold">Checkout</span>
          </div>

          <h1 className="text-2xl font-bold text-teal mb-8">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Shipping form */}
            <motion.form
              onSubmit={handleSubmit}
              className="md:col-span-2 card p-6 space-y-5"
              variants={staggerContainer(0.08)} initial="hidden" animate="visible"
            >
              <motion.h2 variants={staggerItem} className="font-bold text-teal text-lg">
                Shipping Address
              </motion.h2>

              <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input name="name" value={address.name} onChange={handleChange}
                    required placeholder="John Doe" className="input" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input name="phone" value={address.phone} onChange={handleChange}
                    required pattern="[0-9]{10}" placeholder="10-digit number" className="input" />
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <label className="label">Street Address</label>
                <input name="street" value={address.street} onChange={handleChange}
                  required placeholder="House no, Street, Area" className="input" />
              </motion.div>

              <motion.div variants={staggerItem} className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">City</label>
                  <input name="city" value={address.city} onChange={handleChange}
                    required placeholder="Mumbai" className="input" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input name="state" value={address.state} onChange={handleChange}
                    required placeholder="Maharashtra" className="input" />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input name="pincode" value={address.pincode} onChange={handleChange}
                    required pattern="[0-9]{6}" placeholder="400001" className="input" />
                </div>
              </motion.div>

              {/* Razorpay notice */}
              <motion.div variants={staggerItem}
                className="flex items-center gap-3 bg-primary-light border border-primary/20 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p className="text-xs text-primary-dark font-medium">
                  Secure 128-bit encrypted payment via Razorpay. Your card details are never stored.
                </p>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                variants={staggerItem}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading  ? {} : { scale: 0.97 }}
                className="btn-primary w-full py-3.5 text-base font-bold"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block"
                    />
                    Opening Payment…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                    Pay {formatPrice(getTotal() + deliveryFee)} via Razorpay
                  </span>
                )}
              </motion.button>
            </motion.form>

            {/* Order summary */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="card p-5">
                <h2 className="font-bold text-teal mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  {items.map(i => (
                    <div key={i.product_id} className="flex justify-between text-gray-600">
                      <span className="truncate max-w-[65%]">{i.name} <span className="text-gray-400">×{i.qty}</span></span>
                      <span className="font-medium text-teal">{formatPrice(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-teal-mid/40 my-3"/>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-teal">{formatPrice(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-cta font-semibold' : 'font-medium text-teal'}>
                      {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-teal-mid/40 my-3"/>
                <div className="flex justify-between font-bold text-lg text-teal">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getTotal() + deliveryFee)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="card p-4 space-y-3">
                {[
                  ['🔒', 'SSL Secured Checkout'],
                  ['✅', '100% Genuine Medicines'],
                  ['↩️', '7-Day Easy Returns'],
                ].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

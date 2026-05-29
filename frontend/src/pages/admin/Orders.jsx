import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminGetOrders, adminGetOrderDetail, adminUpdateOrder } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['pending','paid','processing','shipped','delivered','cancelled'];
const STATUS_STYLES = {
  pending:    'bg-amber-50   text-amber-700   border-amber-200',
  paid:       'bg-blue-50    text-blue-700    border-blue-200',
  processing: 'bg-orange-50  text-orange-700  border-orange-200',
  shipped:    'bg-indigo-50  text-indigo-700  border-indigo-200',
  delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-50     text-red-600     border-red-200',
};

const IMG_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';

function OrderDetail({ orderId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetOrderDetail(orderId)
      .then(r => setDetail(r.data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="flex items-center gap-2 py-6 px-6 text-xs text-gray-400">
      <svg className="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Loading order details…
    </div>
  );

  if (!detail) return (
    <div className="py-6 px-6 text-xs text-red-400">Failed to load order details.</div>
  );

  let addr = {};
  try { addr = JSON.parse(detail.shipping_address || '{}'); } catch {}

  const subtotal = (detail.items || []).reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);
  const delivery = parseFloat(detail.total) - subtotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-t border-gray-100"
    >
      <div className="px-6 py-5 grid md:grid-cols-3 gap-6">

        {/* ── Items list ── */}
        <div className="md:col-span-2">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Order Items ({detail.items?.length || 0})
          </p>
          <div className="space-y-2">
            {(detail.items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                {/* Product image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-200 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={`${IMG_BASE}${item.image}`}
                      alt={item.name}
                      className="w-12 h-12 object-contain"
                      onError={e => { e.target.style.display='none'; e.target.insertAdjacentHTML('afterend','<span style="font-size:20px">💊</span>'); }}
                    />
                  ) : (
                    <span className="text-xl">💊</span>
                  )}
                </div>

                {/* Name + price */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-teal truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatPrice(item.price)} × {item.qty}
                  </p>
                </div>

                {/* Line total */}
                <p className="text-sm font-black text-primary shrink-0">
                  {formatPrice(parseFloat(item.price) * item.qty)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            {delivery > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Delivery Fee</span>
                <span className="font-semibold">{formatPrice(delivery)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-primary border-t border-gray-100 pt-1.5 mt-1">
              <span>Total</span>
              <span>{formatPrice(detail.total)}</span>
            </div>
          </div>
        </div>

        {/* ── Shipping + Order info ── */}
        <div className="space-y-4">

          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Shipping Address</p>
            {addr.name || addr.address ? (
              <div className="text-xs text-gray-600 space-y-0.5 leading-relaxed">
                {addr.name    && <p className="font-bold text-teal">{addr.name}</p>}
                {addr.phone   && <p>📞 {addr.phone}</p>}
                {addr.address && <p>{addr.address}</p>}
                {(addr.city || addr.state) && (
                  <p>{[addr.city, addr.state].filter(Boolean).join(', ')}{addr.pincode ? ` - ${addr.pincode}` : ''}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No address recorded</p>
            )}
          </div>

          {/* Order meta */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Info</p>
            <div className="text-xs text-gray-600 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID</span>
                <span className="font-bold text-teal">#{detail.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Customer</span>
                <span className="font-semibold">{detail.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="truncate max-w-[140px]">{detail.email}</span>
              </div>
              {detail.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone</span>
                  <span>{detail.customer_phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Placed On</span>
                <span>{new Date(detail.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
              </div>
              {detail.razorpay_order_id && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400 shrink-0">Razorpay ID</span>
                  <span className="font-mono text-[10px] text-gray-500 truncate">{detail.razorpay_order_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [total, setTotal]       = useState(0);
  const [filter, setFilter]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetOrders({ page, status: filter || undefined });
      setOrders(data.orders); setPages(data.pages); setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [page, filter]);

  const handleStatus = async (e, id, status) => {
    e.stopPropagation();
    try {
      await adminUpdateOrder(id, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  const toggleExpand = (id) => setExpanded(ex => ex === id ? null : id);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-teal">Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} total orders · click any row to view items</p>
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-teal bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </motion.div>

      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3.5 w-8"></th>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-50">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 rounded w-24"/></td>
                    ))}
                  </tr>
                ))
              ) : orders.map((o, i) => (
                <>
                  <motion.tr
                    key={o.id}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => toggleExpand(o.id)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors
                      ${expanded === o.id ? 'bg-blue-50/40' : 'hover:bg-gray-50/70'}`}
                  >
                    {/* Expand chevron */}
                    <td className="px-4 py-3.5">
                      <motion.svg
                        animate={{ rotate: expanded === o.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 text-gray-400"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                      </motion.svg>
                    </td>
                    <td className="px-5 py-3.5 font-black text-teal">#{o.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-light text-primary text-[11px] font-black flex items-center justify-center shrink-0">
                          {o.customer?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-700">{o.customer}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{o.email}</td>
                    <td className="px-5 py-3.5 font-bold text-teal">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <select value={o.status} onChange={e => handleStatus(e, o.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                      </select>
                    </td>
                  </motion.tr>

                  {/* Expandable detail row */}
                  <AnimatePresence>
                    {expanded === o.id && (
                      <tr key={`${o.id}-detail`}>
                        <td colSpan={7} className="p-0">
                          <OrderDetail orderId={o.id} />
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => (
                <motion.button key={i+1} onClick={() => setPage(i+1)} whileTap={{ scale:0.9 }}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${page===i+1 ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {i+1}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

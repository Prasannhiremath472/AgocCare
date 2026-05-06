import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminGetOrders, adminUpdateOrder } from '../../services/api';
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

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [total, setTotal]     = useState(0);
  const [filter, setFilter]   = useState('');
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetOrders({ page, status: filter || undefined });
      setOrders(data.orders); setPages(data.pages); setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page, filter]);

  const handleStatus = async (id, status) => {
    try { await adminUpdateOrder(id, { status }); toast.success('Status updated'); fetch(); }
    catch { toast.error('Failed to update'); }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-teal">Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} total orders</p>
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
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 rounded w-24"/></td>
                      ))}
                    </tr>
                  ))
                ) : orders.map((o, i) => (
                  <motion.tr key={o.id}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50/70 transition-colors">
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
                    <td className="px-5 py-3.5">
                      <select value={o.status} onChange={e => handleStatus(o.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
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

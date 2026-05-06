import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminDashboard } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

const STATUS_COLORS = {
  pending:    'bg-amber-100   text-amber-700   border-amber-200',
  paid:       'bg-blue-100    text-blue-700    border-blue-200',
  processing: 'bg-orange-100  text-orange-700  border-orange-200',
  shipped:    'bg-indigo-100  text-indigo-700  border-indigo-200',
  delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled:  'bg-red-100     text-red-600     border-red-200',
};

function StatCard({ icon, value, label, sub, color, iconBg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.10)', transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        {sub && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${sub.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {sub}
          </span>
        )}
      </div>
      <p className={`text-2xl font-black ${color} mb-1`}>{value ?? '—'}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    adminDashboard().then(r => setData(r.data)).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const STATS = data ? [
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
      value: formatPrice(data.revenue), label: 'Total Revenue', sub: '+12%', color: 'text-emerald-600', iconBg: 'bg-emerald-500', delay: 0.05,
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
      value: data.orders, label: 'Total Orders', sub: '+8%', color: 'text-primary', iconBg: 'bg-primary', delay: 0.1,
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
      value: data.users, label: 'Customers', sub: '+24%', color: 'text-purple-600', iconBg: 'bg-purple-500', delay: 0.15,
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>,
      value: data.products, label: 'Products Listed', sub: '+3%', color: 'text-amber-600', iconBg: 'bg-amber-500', delay: 0.2,
    },
  ] : [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Greeting Banner (Medflex-style) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0891B2 0%, #0c4a6e 60%, #134e4a 100%)' }}
      >
        {/* Background shapes */}
        <motion.div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }}/>
        <motion.div className="absolute bottom-0 left-40 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }}/>

        <div className="relative z-10 p-7 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-3xl font-black text-white mb-2">{user?.name || 'Admin'} 👋</h1>
            <p className="text-white/60 text-sm max-w-sm">
              Here's what's happening with your pharmacy store today.
            </p>

            {/* Quick stat pills */}
            {data && (
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                {[
                  { icon: '📦', label: `${data.orders} Orders` },
                  { icon: '💊', label: `${data.products} Products` },
                  { icon: '👥', label: `${data.users} Customers` },
                ].map(s => (
                  <div key={s.label}
                    className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-white text-xs font-semibold">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Illustration */}
          <div className="hidden md:flex items-end gap-4 pr-4">
            {/* Doctor illustration using SVG */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[100px] select-none leading-none"
            >
              👨‍⚕️
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="text-[80px] select-none leading-none mb-2"
            >
              👩‍⚕️
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data ? STATS.map((s, i) => <StatCard key={i} {...s}/>) : (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl mb-4"/>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"/>
              <div className="h-4 bg-gray-100 rounded w-2/3"/>
            </div>
          ))
        )}
      </div>

      {/* ── Bottom row ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-teal">Recent Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest 5 transactions</p>
            </div>
            <Link to="/admin/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.recentOrders?.map((o, i) => (
                  <motion.tr key={o.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-teal">#{o.id}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-light text-primary text-xs font-black flex items-center justify-center shrink-0">
                          {o.customer?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700">{o.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-teal">{formatPrice(o.total)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border capitalize ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </motion.tr>
                )) ?? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="px-6 py-3.5"><div className="h-4 bg-gray-100 rounded w-20"/></td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-teal mb-1">Quick Actions</h2>
          <p className="text-xs text-gray-400 mb-4">Common tasks</p>

          <div className="space-y-2.5">
            {[
              { label: 'Add New Product',  to: '/admin/products', color: 'bg-primary',  icon: '💊', sub: 'Add to catalogue' },
              { label: 'Manage Orders',    to: '/admin/orders',   color: 'bg-blue-500', icon: '📦', sub: 'View & update' },
              { label: 'View Customers',   to: '/admin/users',    color: 'bg-purple-500',icon: '👥', sub: 'Customer list' },
              { label: 'View Store',       to: '/',               color: 'bg-emerald-500',icon: '🏪', sub: 'Preview website' },
            ].map((a, i) => (
              <motion.div key={a.label}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}>
                <Link to={a.to}>
                  <motion.div
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary-light/30 transition-all group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center text-lg shrink-0 shadow-sm`}>
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-teal group-hover:text-primary transition-colors">{a.label}</p>
                      <p className="text-[11px] text-gray-400">{a.sub}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Support contact — Medflex-style */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-5 rounded-2xl p-4 text-white text-center"
            style={{ background: 'linear-gradient(135deg, #0891B2, #134e4a)' }}
          >
            <div className="text-2xl mb-1">📞</div>
            <p className="text-xs font-bold text-white/70 mb-0.5">Support Helpline</p>
            <p className="text-base font-black">+91 98765 43210</p>
            <p className="text-[10px] text-white/50 mt-0.5">Available 24/7</p>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

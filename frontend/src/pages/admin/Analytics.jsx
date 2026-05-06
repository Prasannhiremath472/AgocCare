import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getAnalytics } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const COLORS = ['#0891B2','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

const STATUS_COLORS = {
  paid:       '#10b981',
  pending:    '#f59e0b',
  processing: '#f97316',
  shipped:    '#6366f1',
  delivered:  '#0891B2',
  cancelled:  '#ef4444',
};

function KpiCard({ icon, label, value, sub, subColor, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${subColor}`}>{sub}</span>
        )}
      </div>
      <p className="text-2xl font-black text-teal">{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-teal mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {currency ? formatPrice(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]   = useState('7d');

  useEffect(() => {
    getAnalytics()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-xl mb-3"/>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"/>
            <div className="h-3 bg-gray-100 rounded w-1/2"/>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse h-72"/>
        ))}
      </div>
    </div>
  );

  const { kpi, revenueByDay, ordersByStatus, topProducts, byCategory, monthly } = data || {};

  const kpiCards = [
    { icon: '💰', label: 'Total Revenue',    value: formatPrice(kpi?.total_revenue || 0), sub: 'All time',        subColor: 'bg-emerald-50 text-emerald-600', delay: 0.05 },
    { icon: '📦', label: 'Total Orders',     value: kpi?.total_orders || 0,               sub: `${kpi?.today_orders || 0} today`, subColor: 'bg-blue-50 text-blue-600', delay: 0.1 },
    { icon: '✅', label: 'Paid Orders',      value: kpi?.paid_orders || 0,               sub: kpi?.total_orders ? `${Math.round((kpi.paid_orders/kpi.total_orders)*100)}%` : '0%', subColor: 'bg-emerald-50 text-emerald-600', delay: 0.15 },
    { icon: '❌', label: 'Cancelled',         value: kpi?.cancelled_orders || 0,          sub: kpi?.total_orders ? `${Math.round((kpi.cancelled_orders/kpi.total_orders)*100)}%` : '0%', subColor: 'bg-red-50 text-red-500', delay: 0.2 },
    { icon: '🛒', label: 'Avg Order Value',  value: formatPrice(kpi?.avg_order_value || 0), sub: 'Per paid order', subColor: 'bg-amber-50 text-amber-600', delay: 0.25 },
    { icon: '👥', label: 'New Customers',    value: kpi?.new_users || 0,                 sub: 'Last 30 days',   subColor: 'bg-purple-50 text-purple-600', delay: 0.3 },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-teal">Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">Store performance overview</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {['7d','Monthly'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${range === r ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-teal'}`}>
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((k, i) => <KpiCard key={i} {...k}/>)}
      </div>

      {/* ── Row 1: Revenue chart + Orders by status ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Revenue / Orders Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-teal">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {range === '7d' ? 'Last 7 days' : 'Last 6 months'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"/>Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cta inline-block"/>Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={range === '7d' ? revenueByDay : monthly}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0891B2" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey={range === '7d' ? 'date' : 'month'}
                tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="rev" orientation="left"
                tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`}/>
              <YAxis yAxisId="ord" orientation="right"
                tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip currency/>}/>
              <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue"
                stroke="#0891B2" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r:5, fill:'#0891B2' }}/>
              <Area yAxisId="ord" type="monotone" dataKey="orders" name="Orders"
                stroke="#10b981" strokeWidth={2} fill="url(#ordGrad)" dot={false} activeDot={{ r:4, fill:'#10b981' }}/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders by Status — Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-teal mb-1">Orders by Status</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution</p>
          {ordersByStatus?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={ordersByStatus} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {ordersByStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n?.charAt(0).toUpperCase() + n?.slice(1)]}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {ordersByStatus.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: STATUS_COLORS[s.name] || COLORS[i % COLORS.length] }}/>
                      <span className="capitalize text-gray-600 font-medium">{s.name}</span>
                    </div>
                    <span className="font-bold text-teal">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-sm">No order data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 2: Top Products + Category Sales ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Top Products — Horizontal Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-teal mb-1">Top Selling Products</h2>
          <p className="text-xs text-gray-400 mb-5">By units sold (paid orders)</p>
          {topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" width={120}
                  tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="sold" name="Units Sold" fill="#0891B2" radius={[0,6,6,0]} maxBarSize={20}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <span className="text-4xl mb-2">💊</span>
              <p className="text-sm">No sales data yet</p>
            </div>
          )}
        </motion.div>

        {/* Sales by Category — Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <h2 className="font-bold text-teal mb-1">Revenue by Category</h2>
          <p className="text-xs text-gray-400 mb-5">Paid orders only</p>
          {byCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategory} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`}/>
                <Tooltip content={<CustomTooltip currency/>}/>
                <Bar dataKey="revenue" name="Revenue" radius={[6,6,0,0]} maxBarSize={40}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <span className="text-4xl mb-2">📦</span>
              <p className="text-sm">No category data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 3: Top Products Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-teal">Product Performance</h2>
          <p className="text-xs text-gray-400 mt-0.5">Top products by revenue (paid orders)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Units Sold</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts?.length > 0 ? topProducts.map((p, i) => {
                const totalRev = topProducts.reduce((s, x) => s + x.revenue, 0);
                const share    = totalRev > 0 ? Math.round((p.revenue / totalRev) * 100) : 0;
                return (
                  <motion.tr key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white
                        ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-teal max-w-[200px]">
                      <span className="line-clamp-1">{p.name}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal">{p.sold}</span>
                        <span className="text-gray-400 text-xs">units</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600">{formatPrice(p.revenue)}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[80px]">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${share}%` }}
                            transition={{ delay: 0.7 + i * 0.05, duration: 0.6, ease: [0.22,1,0.36,1] }}
                            className="h-1.5 bg-primary rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-500">{share}%</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No sales data yet. Place some orders to see analytics.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminGetUsers } from '../../services/api';
import * as XLSX from 'xlsx';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    adminGetUsers().then(r => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins    = users.filter(u => u.role === 'admin').length;
  const customers = users.filter(u => u.role === 'user').length;

  const exportExcel = () => {
    const data = filtered.map(u => ({
      'Name':        u.name,
      'Email':       u.email,
      'Mobile':      u.phone || '—',
      'Role':        u.role,
      'Verified':    u.is_verified ? 'Yes' : 'No',
      'Joined Date': new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch:25 },{ wch:30 },{ wch:15 },{ wch:10 },{ wch:10 },{ wch:15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, `AgocCare_Customers_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-teal">Customers</h1>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-teal bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm w-52"/>
          </div>
          <motion.button onClick={exportExcel} disabled={!filtered.length}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-cta text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-cta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export Excel
          </motion.button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="grid grid-cols-3 gap-4">
        {[
          { label:'Total Users',  value: users.length, color:'text-teal',    bg:'bg-teal-light',    icon:'👥' },
          { label:'Customers',    value: customers,    color:'text-primary',  bg:'bg-primary-light', icon:'🛒' },
          { label:'Admins',       value: admins,       color:'text-purple-600',bg:'bg-purple-50',    icon:'⚙️' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-teal-mid/20`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Mobile</th>
                <th className="px-5 py-3.5">Verified</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(4).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 rounded w-28"/></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((u, i) => (
                <motion.tr key={u.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-teal text-white text-sm font-black flex items-center justify-center shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-teal">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{u.email}</td>
                  <td className="px-5 py-3.5 text-gray-600 text-xs font-medium">
                    {u.phone || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg border
                      ${u.is_verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                      {u.is_verified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border
                      ${u.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {u.role === 'admin' ? '⚙️ Admin' : '👤 Customer'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

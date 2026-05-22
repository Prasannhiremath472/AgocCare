import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const STATUS_COLORS = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');

  useEffect(() => {
    api.get('/consultation')
      .then(r => { setConsultations(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = consultations.filter(c =>
    c.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-teal">Consultation Requests</h1>
          <p className="text-xs text-gray-400 mt-0.5">{consultations.length} total requests</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient…"
            className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-teal bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm w-52"/>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="grid grid-cols-4 gap-4">
        {[
          { label:'Total',     value: consultations.length,                                        color:'text-teal',     bg:'bg-teal-light',    icon:'🩺' },
          { label:'Pending',   value: consultations.filter(c => c.status === 'pending').length,    color:'text-amber-600',bg:'bg-amber-50',      icon:'⏳' },
          { label:'Confirmed', value: consultations.filter(c => c.status === 'confirmed').length,  color:'text-blue-600', bg:'bg-blue-50',       icon:'✅' },
          { label:'Completed', value: consultations.filter(c => c.status === 'completed').length,  color:'text-green-600',bg:'bg-green-50',      icon:'🎉' },
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
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Age</th>
                <th className="px-5 py-3.5">Consultation</th>
                <th className="px-5 py-3.5">Date & Slot</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 rounded w-24"/></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">🩺</div>
                    <p className="font-semibold">No consultation requests yet</p>
                    <p className="text-xs mt-1">Patient bookings will appear here</p>
                  </td>
                </tr>
              ) : filtered.map((c, i) => (
                <motion.tr key={c.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-white text-sm font-black flex items-center justify-center shrink-0">
                        {c.patient_name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-teal text-sm">{c.patient_name}</p>
                        {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 text-xs font-medium">{c.phone}</td>
                  <td className="px-5 py-3.5 text-gray-600 text-xs">{c.age} yrs</td>
                  <td className="px-5 py-3.5 text-gray-600 text-xs max-w-[180px]">
                    <p className="truncate font-medium">{c.consultation_type}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">
                    <p className="font-semibold">{c.preferred_date ? fmt(c.preferred_date) : '—'}</p>
                    <p className="text-gray-400">{c.time_slot || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg border capitalize ${STATUS_COLORS[c.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{fmt(c.created_at)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

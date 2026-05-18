import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const ACTION_COLORS = {
  CREATE:        'bg-green-100 text-green-700',
  UPDATE:        'bg-blue-100 text-blue-700',
  DELETE:        'bg-red-100 text-red-700',
  STATUS_CHANGE: 'bg-amber-100 text-amber-700',
  BULK_UPLOAD:   'bg-purple-100 text-purple-700',
};

const ENTITY_ICONS = {
  product: '💊', order: '📦', user: '👤', offer: '🏷️', category: '📂',
};

export default function AuditLogs() {
  const [logs, setLogs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filters, setFilters]   = useState({ action:'', entity:'', search:'', from:'', to:'' });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const { data } = await api.get('/admin/audit-logs', { params });
      setLogs(data.logs); setTotal(data.total); setPages(data.pages);
    } catch { setLogs([]); }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilter = e => { setFilters(f => ({ ...f, [e.target.name]: e.target.value })); setPage(1); };
  const clearFilters = () => { setFilters({ action:'', entity:'', search:'', from:'', to:'' }); setPage(1); };
  const fmt = d => new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-teal">Audit Logs</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} total actions logged</p>
        </div>
        <button onClick={fetchLogs} className="btn-outline text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-teal-mid/30 shadow-card p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <div className="lg:col-span-2">
            <label className="label">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
              </svg>
              <input name="search" value={filters.search} onChange={handleFilter} placeholder="Search description..." className="input pl-9 text-sm"/>
            </div>
          </div>
          <div>
            <label className="label">Action</label>
            <select name="action" value={filters.action} onChange={handleFilter} className="input text-sm">
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="STATUS_CHANGE">Status Change</option>
              <option value="BULK_UPLOAD">Bulk Upload</option>
            </select>
          </div>
          <div>
            <label className="label">Entity</label>
            <select name="entity" value={filters.entity} onChange={handleFilter} className="input text-sm">
              <option value="">All Entities</option>
              <option value="product">Product</option>
              <option value="order">Order</option>
              <option value="user">User</option>
              <option value="offer">Offer</option>
              <option value="category">Category</option>
            </select>
          </div>
          <div>
            <label className="label">From Date</label>
            <input type="date" name="from" value={filters.from} onChange={handleFilter} className="input text-sm"/>
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" name="to" value={filters.to} onChange={handleFilter} className="input text-sm"/>
          </div>
        </div>
        {Object.values(filters).some(v => v) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Active filters:</span>
            {Object.entries(filters).filter(([,v]) => v).map(([k,v]) => (
              <span key={k} className="bg-primary-light text-primary text-xs font-semibold px-2 py-0.5 rounded-lg">{k}: {v}</span>
            ))}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-semibold">Clear all</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3.5">Time</th>
                <th className="px-4 py-3.5">Admin</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Entity</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">IP</th>
                <th className="px-4 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(8).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-24"/></td>
                  ))}
                </tr>
              )) : logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-semibold">No audit logs found</p>
                  <p className="text-xs mt-1">Admin actions will appear here</p>
                </td></tr>
              ) : logs.map((log, i) => (
                <>
                  <motion.tr key={log.id}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03 }}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{fmt(log.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {log.admin_email?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600 max-w-[120px] truncate">{log.admin_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-teal flex items-center gap-1">
                        {ENTITY_ICONS[log.entity] || '📄'} {log.entity}
                        {log.entity_id && <span className="text-gray-400">#{log.entity_id}</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[220px]">
                      <p className="truncate">{log.description}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">{log.ip_address}</td>
                    <td className="px-4 py-3.5">
                      {(log.old_value || log.new_value) && (
                        <button className={`text-xs font-bold ${expanded === log.id ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                          {expanded === log.id ? '▲ Hide' : '▼ Show'}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                  {expanded === log.id && (log.old_value || log.new_value) && (
                    <tr key={`${log.id}-d`}>
                      <td colSpan={7} className="px-4 py-3 bg-gray-50/80">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {log.old_value && (
                            <div>
                              <p className="font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Before</p>
                              <pre className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 overflow-auto max-h-32 text-[11px]">
                                {JSON.stringify(JSON.parse(log.old_value), null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_value && (
                            <div>
                              <p className="font-bold text-gray-500 mb-1.5 uppercase tracking-wide">After</p>
                              <pre className="bg-green-50 border border-green-100 rounded-xl p-3 text-green-700 overflow-auto max-h-32 text-[11px]">
                                {JSON.stringify(JSON.parse(log.new_value), null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {pages} · {total} logs</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">←</button>
              {Array.from({length:Math.min(5,pages)},(_,i)=>i+Math.max(1,page-2)).filter(p=>p<=pages).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold ${page===p?'bg-primary text-white':'text-gray-500 hover:bg-gray-100'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

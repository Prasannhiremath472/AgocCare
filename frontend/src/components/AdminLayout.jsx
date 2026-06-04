import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const NAV = [
  {
    group: 'Main',
    items: [
      { to: '/admin', label: 'Dashboard', end: true, icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      )},
      { to: '/admin/analytics', label: 'Analytics', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      )},
    ]
  },
  {
    group: 'Catalogue',
    items: [
      { to: '/admin/products', label: 'Products', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
      )},
      { to: '/admin/categories', label: 'Categories', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
      )},
      { to: '/admin/offers', label: 'Offers', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
      )},
      { to: '/admin/bulk-upload', label: 'Bulk Upload', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
      )},
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
      )},
    ]
  },
  {
    group: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
      )},
    ]
  },
  {
    group: 'People',
    items: [
      { to: '/admin/users', label: 'Customers', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      )},
      { to: '/admin/seo', label: 'SEO Settings', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-7 4v-4m0 0V9m0 2h2m-2 0H9"/></svg>
      )},
    ]
  },
];

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const pageTitle = NAV.flatMap(g => g.items).find(n =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  )?.label || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" style={{ fontFamily: "'Figtree', sans-serif" }}>

      {/* ══ SIDEBAR ══ */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="bg-teal text-white flex flex-col shrink-0 overflow-hidden relative shadow-xl z-20 h-screen"
      >
        {/* Logo */}
        <div className="h-[64px] flex items-center px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.img
              src="/Agoccarelogo.jpeg"
              alt="AgocCare"
              className="h-9 w-9 object-contain rounded-lg bg-white p-0.5 shrink-0"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap">
                  <span className="font-black text-[17px] text-white">Agoc <span className="text-secondary">Care+</span></span>
                  <p className="text-[10px] text-white/40 font-medium -mt-0.5">Admin Panel</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Profile block */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="mx-3 mt-4 mb-2 bg-white/8 rounded-2xl p-3 flex items-center gap-3 overflow-hidden border border-white/10"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[11px] text-white/45 truncate">{user?.email}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-2 scrollbar-hide min-h-0">
          {NAV.map(group => (
            <div key={group.group}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] px-3 mb-1">
                    {group.group}
                  </motion.p>
                )}
              </AnimatePresence>
              {group.items.map(item => (
                <NavLink
                  key={item.to} to={item.to} end={item.end}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                     transition-all duration-150 group mb-0.5
                     ${isActive
                       ? 'bg-primary text-white shadow-btn'
                       : 'text-white/60 hover:bg-white/10 hover:text-white'
                     }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="overflow-hidden whitespace-nowrap">
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && (
                        <motion.div layoutId="sidebar-pill"
                          className="absolute right-2 w-1.5 h-6 bg-white/40 rounded-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-white/10 space-y-0.5">
          <NavLink to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{opacity:0,width:0}} animate={{opacity:1,width:'auto'}} exit={{opacity:0,width:0}} className="whitespace-nowrap overflow-hidden text-sm">
                  View Store
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-colors">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{opacity:0,width:0}} animate={{opacity:1,width:'auto'}} exit={{opacity:0,width:0}} className="whitespace-nowrap overflow-hidden">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* ══ MAIN ══ */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Topbar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-[64px] bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-10"
        >
          <div className="flex items-center gap-4">
            {/* Collapse toggle */}
            <motion.button onClick={() => setCollapsed(v => !v)}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </motion.button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Home</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
              <span className="font-semibold text-teal">{pageTitle}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
              </svg>
              <input placeholder="Quick search…" className="text-sm bg-transparent focus:outline-none w-40 placeholder:text-gray-400 text-teal"/>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cta rounded-full"/>
            </button>

            {/* User pill */}
            <div className="flex items-center gap-2 bg-primary-light border border-primary/20 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-teal leading-none">{user?.name?.split(' ')[0] || 'Admin'}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page content — only this scrolls */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Outlet/>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

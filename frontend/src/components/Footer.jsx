import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeUp, viewport } from '../utils/motion';

const LINKS = {
  Shop:    [['All Medicines','/medicines'],['Tablets','/medicines?category=tablets'],['Vitamins','/medicines?category=vitamins'],['Skincare','/medicines?category=skincare'],['Devices','/medicines?category=medical-devices']],
  Account: [['Login','/login'],['Register','/register'],['My Orders','/orders'],['Cart','/cart']],
  Company: [['About Us','#'],['Contact Us','#'],['Privacy Policy','#'],['Terms of Service','#'],['Refund Policy','#']],
};

export default function Footer() {
  return (
    <footer className="bg-teal text-white">
      <motion.div
        className="container mx-auto px-4 py-12 grid sm:grid-cols-2 md:grid-cols-5 gap-8"
        initial="hidden" whileInView="visible" viewport={viewport}
        variants={staggerContainer(0.08)}
      >
        {/* Brand */}
        <motion.div variants={staggerItem} className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <motion.div
              whileHover={{ scale:1.1, rotate:8 }}
              transition={{ type:'spring', stiffness:400, damping:12 }}
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </motion.div>
            <span className="text-xl font-bold">Agoc Care<span className="text-secondary">+</span></span>
          </Link>
          <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs">
            India's trusted online pharmacy. Genuine medicines, vitamins and healthcare products delivered to your door.
          </p>
          <div className="flex flex-col gap-2 mb-5">
            {[
              ['M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 12.45a19.79 19.79 0 01-3.07-8.67A2 2 0 011.72 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L5.25 10.1a16 16 0 006.29 6.29l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z', '+91 98765 43210'],
              ['M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 'support@Agoc Care.com'],
            ].map(([path, label]) => (
              <span key={label} className="flex items-center gap-2 text-xs text-white/60">
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path}/>
                </svg>
                {label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/40 mr-1">We accept:</span>
            {['Visa','MC','UPI','Net Banking'].map(p => (
              <motion.span key={p} whileHover={{ scale:1.08 }}
                className="bg-white/10 border border-white/10 rounded px-2 py-0.5 text-[10px] font-bold text-white/70 cursor-default">
                {p}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, links]) => (
          <motion.div key={heading} variants={staggerItem}>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map(([label, to]) => (
                <li key={label}>
                  <motion.div whileHover={{ x:4 }} transition={{ duration:0.15 }}>
                    <Link to={to} className="text-sm text-white/55 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Agoc Care. All rights reserved.</span>
          <span>Licensed Online Pharmacy · GSTIN: 27XXXXX1234X1ZX</span>
        </div>
      </div>
    </footer>
  );
}

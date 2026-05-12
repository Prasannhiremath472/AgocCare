import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeUp, viewport } from '../utils/motion';

const LINKS = {
  Shop:    [['All Medicines','/medicines'],['Tablets','/medicines?category=tablets'],['Vitamins','/medicines?category=vitamins'],['Skincare','/medicines?category=skincare'],['Devices','/medicines?category=medical-devices']],
  Account: [['Login','/login'],['Register','/register'],['My Orders','/orders'],['Cart','/cart']],
  Company: [['About Us','/about'],['Privacy Policy','/privacy-policy'],['Terms of Service','#'],['Refund Policy','#']],
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
            <img src="/Agoccarelogo.jpeg" alt="AgocCare" className="h-10 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="text-sm text-white/60 leading-relaxed mb-2 max-w-xs">
            Empowering Life — Genuine medicines & healthcare products delivered to your door.
          </p>
          <p className="text-xs text-white/40 mb-5 max-w-xs">
            Palladium Building, Near Pristine Womens Hospital, Assembly Road, Shahupuri, Kolhapur
          </p>
          <div className="flex flex-col gap-2 mb-5">
            {[
              ['M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 12.45a19.79 19.79 0 01-3.07-8.67A2 2 0 011.72 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L5.25 10.1a16 16 0 006.29 6.29l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z', '+91 99232 68310'],
              ['M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 'agoccarepvtltd@gmail.com'],
              ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'Mon–Sat: 9:00 AM – 7:00 PM'],
            ].map(([path, label]) => (
              <span key={label} className="flex items-center gap-2 text-xs text-white/60">
                <svg className="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <span>© {new Date().getFullYear()} Agoc Care Private Limited. All rights reserved.</span>
          <span>Drug Lic: 20B-618039, 21B-618040 · GSTIN: 27AAOCA4424F1ZQ</span>
        </div>
      </div>
    </footer>
  );
}

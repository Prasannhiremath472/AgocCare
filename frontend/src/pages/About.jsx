import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeUp, viewport } from '../utils/motion';

export default function About() {
  return (
    <>
      <Helmet><title>About Us | Agoc Care+</title></Helmet>
      <div className="bg-teal-light min-h-screen">

        {/* Hero */}
        <section className="bg-teal py-20 px-4 text-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="visible" className="max-w-2xl mx-auto">
            <motion.p variants={fadeUp} className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">About Us</motion.p>
            <div className="overflow-hidden mb-4">
              <motion.h1 className="text-4xl md:text-5xl font-extrabold text-white"
                initial={{ y:'110%' }} animate={{ y:'0%' }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}>
                Empowering Life
              </motion.h1>
            </div>
            <motion.p variants={fadeUp} className="text-white/60 text-base leading-relaxed">
              Agoc Care Private Limited is a licensed pharma product marketing, wholesale and retail company dedicated to making genuine medicines accessible across India.
            </motion.p>
          </motion.div>
        </section>

        {/* About Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div className="grid md:grid-cols-2 gap-10 items-start"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our Story</p>
                <h2 className="text-3xl font-extrabold text-teal mb-4">Est. 2016 — Built on Trust</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Founded in 2016 by Satyajeet Kadavekar, Agoc Care Private Limited was established with a singular mission — to make authentic, affordable healthcare products accessible to every individual, regardless of location or income.
                </p>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Based in Kolhapur, Maharashtra, we operate as a pharma product marketing, wholesale, and retail business serving customers across India. With a focus on quality and compliance, every product we offer is sourced from licensed manufacturers and brands.
                </p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  From our humble beginnings to a growing online platform, we remain committed to the same core belief: your health is our responsibility.
                </p>
                <Link to="/medicines" className="btn-primary">Shop Now</Link>
              </motion.div>

              <motion.div variants={staggerContainer(0.08)} className="grid grid-cols-2 gap-4">
                {[
                  { n:'2016', l:'Year Established' },
                  { n:'50K+', l:'Products Listed'  },
                  { n:'100%', l:'Genuine Products'  },
                  { n:'Pan India', l:'Delivery'     },
                ].map(s => (
                  <motion.div key={s.l} variants={staggerItem}
                    className="bg-white rounded-2xl p-5 text-center border border-teal-mid/30 shadow-sm">
                    <p className="text-2xl font-extrabold text-primary">{s.n}</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">{s.l}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Why Choose Us</p>
              <h2 className="text-3xl font-extrabold text-teal mb-10">What Makes Us Different</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-3 gap-6"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              {[
                { t:'100% Genuine',        b:'All products sourced from licensed manufacturers and verified brands only.' },
                { t:'Fast Delivery',       b:'Quick dispatch with reliable courier partners across India.' },
                { t:'Licensed Pharmacists',b:'Expert guidance available Mon–Sat, 9 AM to 7 PM.' },
                { t:'Secure Payments',     b:'128-bit encrypted checkout via Razorpay. Safe & trusted.' },
                { t:'Easy Returns',        b:'7-day return policy for damaged or wrong products delivered.' },
                { t:'WhatsApp Support',    b:'Reach us instantly on WhatsApp: +91 91589 90002.' },
              ].map(v => (
                <motion.div key={v.t} variants={staggerItem}
                  className="bg-teal-light rounded-2xl p-6 border border-teal-mid/30 text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-teal mb-1">{v.t}</h3>
                  <p className="text-sm text-gray-500">{v.b}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport} className="text-center mb-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Get In Touch</p>
              <h2 className="text-3xl font-extrabold text-teal">Contact Us</h2>
            </motion.div>
            <motion.div className="grid sm:grid-cols-2 gap-6"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              {[
                { label:'Customer Support', value:'+91 99232 68310', icon:'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 12.45a19.79 19.79 0 01-3.07-8.67A2 2 0 011.72 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L5.25 10.1a16 16 0 006.29 6.29l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z' },
                { label:'WhatsApp', value:'+91 91589 90002', icon:'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 12.45a19.79 19.79 0 01-3.07-8.67A2 2 0 011.72 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L5.25 10.1a16 16 0 006.29 6.29l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z' },
                { label:'Email', value:'agoccarepvtltd@gmail.com', icon:'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { label:'Support Hours', value:'Mon–Sat: 9:00 AM – 7:00 PM', icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label:'Office Address', value:'Palladium Building, Near Pristine Womens Hospital, Assembly Road, Shahupuri, Kolhapur', icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                { label:'Reg. Address', value:'484/2 Warasgoan Naka, Post Kolad, Tal Kolad, Dist Raigad, Maharashtra – 402304', icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              ].map(c => (
                <motion.div key={c.label} variants={staggerItem}
                  className="bg-white rounded-2xl p-5 border border-teal-mid/30 shadow-sm flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon}/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{c.label}</p>
                    <p className="text-sm font-semibold text-teal leading-relaxed">{c.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Licenses */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
              className="mt-8 bg-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Licenses & Registration</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-teal font-semibold">
                <span>GSTIN: 27AAOCA4424F1ZQ</span>
                <span className="text-gray-300">|</span>
                <span>Drug Lic: 20B-618039</span>
                <span className="text-gray-300">|</span>
                <span>Drug Lic: 21B-618040</span>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}

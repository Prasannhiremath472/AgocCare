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
            <motion.p variants={fadeUp} className="text-xs font-bold text-primary uppercase tracking-widest mb-3">About Us</motion.p>
            <div className="overflow-hidden mb-4">
              <motion.h1 className="text-4xl md:text-5xl font-extrabold text-white"
                initial={{ y:'110%' }} animate={{ y:'0%' }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}>
                Healthcare for Every Indian
              </motion.h1>
            </div>
            <motion.p variants={fadeUp} className="text-white/60 text-base leading-relaxed">
              Agoc Care+ is India's trusted online pharmacy delivering genuine medicines, vitamins and healthcare products at your doorstep.
            </motion.p>
          </motion.div>
        </section>

        {/* Mission */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div className="grid md:grid-cols-2 gap-8 items-center"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              <motion.div variants={fadeUp}>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our Mission</p>
                <h2 className="text-3xl font-extrabold text-teal mb-4">Making healthcare accessible & affordable</h2>
                <p className="text-gray-500 leading-relaxed mb-4">We believe every Indian deserves access to genuine, affordable healthcare. Agoc Care+ was built to make that a reality — one prescription at a time.</p>
                <Link to="/medicines" className="btn-primary">Shop Now</Link>
              </motion.div>
              <motion.div variants={staggerContainer(0.08)} className="grid grid-cols-2 gap-4">
                {[
                  { n:'2M+',  l:'Happy Customers' },
                  { n:'50K+', l:'Products'         },
                  { n:'500+', l:'Brands'            },
                  { n:'99%',  l:'On-Time Delivery'  },
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

        {/* Values */}
        <section className="bg-white py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
              className="text-3xl font-extrabold text-teal mb-10">Our Values</motion.h2>
            <motion.div className="grid sm:grid-cols-3 gap-6"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={viewport}>
              {[
                { icon:'✅', t:'Authenticity',  b:'100% genuine medicines from licensed manufacturers.' },
                { icon:'⚡', t:'Speed',         b:'Same-day dispatch on orders placed before 2 PM.' },
                { icon:'❤️', t:'Care',           b:'Licensed pharmacists available 24/7 for support.' },
              ].map(v => (
                <motion.div key={v.t} variants={staggerItem}
                  className="bg-teal-light rounded-2xl p-6 border border-teal-mid/30">
                  <div className="text-3xl mb-3">{v.icon}</div>
                  <h3 className="font-bold text-teal mb-1">{v.t}</h3>
                  <p className="text-sm text-gray-500">{v.b}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}

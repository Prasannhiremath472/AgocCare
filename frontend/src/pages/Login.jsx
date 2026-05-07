import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { login } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { staggerContainer, staggerItem, fadeUp, scaleIn } from '../utils/motion';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname || '/';

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : from, { replace:true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Login | Agoc Care</title></Helmet>
      <div className="min-h-[85vh] bg-teal-light flex items-center justify-center px-4 py-12">

        {/* Decorative blobs */}
        <motion.div className="fixed top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
          animate={{ scale:[1,1.2,1], opacity:[0.5,0.8,0.5] }} transition={{ duration:6, repeat:Infinity }}/>
        <motion.div className="fixed bottom-20 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none"
          animate={{ scale:[1,1.15,1], opacity:[0.4,0.7,0.4] }} transition={{ duration:8, repeat:Infinity, delay:1 }}/>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial="hidden" animate="visible"
          variants={staggerContainer(0.1)}
        >
          <motion.div variants={scaleIn} className="card p-8 shadow-card-lg">

            {/* Logo */}
            <motion.div variants={fadeUp} className="text-center mb-7">
              <Link to="/" className="inline-flex items-center justify-center mb-4">
                <motion.img
                  src="/logo.png"
                  alt="AgocCare"
                  className="h-16 w-auto object-contain"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                />
              </Link>
              <h1 className="text-2xl font-bold text-teal">Welcome back</h1>
              <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={staggerItem}>
                <label className="label">Email Address</label>
                <input type="email" value={form.email} autoComplete="email"
                  onChange={e => setForm(f => ({ ...f, email:e.target.value }))}
                  placeholder="you@example.com" required className="input"/>
              </motion.div>

              <motion.div variants={staggerItem}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={form.password} autoComplete="current-password"
                    onChange={e => setForm(f => ({ ...f, password:e.target.value }))}
                    placeholder="••••••••" required className="input pr-10"/>
                  <button type="button" onClick={() => setShow(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {show
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                      }
                    </svg>
                  </button>
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={loading ? {} : { scale:1.02 }}
                  whileTap={loading  ? {} : { scale:0.97 }}
                  className="btn-primary w-full py-3 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                      />
                      Signing in…
                    </span>
                  ) : 'Sign In'}
                </motion.button>
              </motion.div>
            </form>

            <motion.p variants={fadeUp} className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
            </motion.p>
          </motion.div>

          <motion.p variants={fadeUp} className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5 text-cta" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            Secured with 128-bit encryption
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}

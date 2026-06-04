import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { motion } from 'framer-motion';
import { loginSendOTP, loginVerifyOTP } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { staggerContainer, staggerItem, fadeUp, scaleIn } from '../utils/motion';
import toast from 'react-hot-toast';

export default function Login() {
  const [step, setStep]       = useState(1); // 1=email, 2=otp
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname || '/';

  // Step 1 — send OTP
  const handleSendOTP = async e => {
    e.preventDefault();
    setSending(true);
    try {
      await loginSendOTP({ email });
      toast.success(`OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
    setSending(false);
  };

  // Step 2 — verify OTP
  const handleVerify = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginVerifyOTP({ email, otp });
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setSending(true);
    try {
      await loginSendOTP({ email });
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend OTP'); }
    setSending(false);
  };

  return (
    <>
      <SeoHead pageKey="login" defaults={{ title: 'Sign In – AgocCare', robots: 'noindex,follow' }} />
      <div className="min-h-[85vh] bg-teal-light flex items-center justify-center px-4 py-12">

        <motion.div className="fixed top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
          animate={{ scale:[1,1.2,1], opacity:[0.5,0.8,0.5] }} transition={{ duration:6, repeat:Infinity }}/>
        <motion.div className="fixed bottom-20 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none"
          animate={{ scale:[1,1.15,1], opacity:[0.4,0.7,0.4] }} transition={{ duration:8, repeat:Infinity, delay:1 }}/>

        <motion.div className="w-full max-w-md relative z-10"
          initial="hidden" animate="visible" variants={staggerContainer(0.1)}>
          <motion.div variants={scaleIn} className="card p-8 shadow-card-lg">

            {/* Logo */}
            <motion.div variants={fadeUp} className="text-center mb-7">
              <Link to="/" className="inline-flex items-center justify-center mb-4">
                <img src="/Agoccarelogo.jpeg" alt="AgocCare" className="h-16 w-auto object-contain"/>
              </Link>
              <h1 className="text-2xl font-bold text-teal">
                {step === 1 ? 'Welcome back' : 'Verify your email'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {step === 1 ? 'Enter your email to receive a login OTP' : `OTP sent to ${email}`}
              </p>
            </motion.div>

            {/* Step 1 — Email */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <motion.div variants={staggerItem}>
                  <label className="label">Email Address</label>
                  <input type="email" value={email} autoComplete="email"
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required className="input"/>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <motion.button type="submit" disabled={sending}
                    whileHover={sending ? {} : { scale:1.02 }}
                    whileTap={sending ? {} : { scale:0.97 }}
                    className="btn-primary w-full py-3 text-sm">
                    {sending
                      ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending OTP…</span>
                      : 'Send OTP →'}
                  </motion.button>
                </motion.div>
              </form>
            )}

            {/* Step 2 — OTP */}
            {step === 2 && (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 text-center">
                  Check your inbox at <strong>{email}</strong>
                </div>

                <motion.div variants={staggerItem}>
                  <label className="label text-center block">Enter 6-digit OTP</label>
                  <input
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="● ● ● ● ● ●"
                    maxLength={6} required autoFocus
                    className="input text-center text-2xl font-bold tracking-[0.5em] py-4"
                  />
                </motion.div>

                <motion.button type="submit" disabled={loading || otp.length < 6}
                  whileHover={loading ? {} : { scale:1.02 }}
                  whileTap={loading ? {} : { scale:0.97 }}
                  className="btn-primary w-full py-3 text-sm">
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Verifying…</span>
                    : 'Verify & Sign In'}
                </motion.button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setStep(1); setOtp(''); }}
                    className="text-gray-400 hover:text-teal transition-colors">
                    ← Change email
                  </button>
                  <button type="button" onClick={handleResend} disabled={sending}
                    className="text-primary font-semibold hover:underline">
                    {sending ? 'Sending…' : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            <motion.p variants={fadeUp} className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
            </motion.p>
          </motion.div>

          <motion.p variants={fadeUp} className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5 text-cta" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            No password needed · OTP login only
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import api, { register } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ name: '', email: '' });
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();

  const handleSendOTP = async e => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/otp/send', { email: form.email, name: form.name });
      toast.success(`OTP sent to ${form.email}`);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
    setSending(false);
  };

  const handleVerifyAndRegister = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/otp/verify', { email: form.email, otp });
      const { data } = await register({ name: form.name, email: form.email });
      setAuth(data.user, data.token);
      toast.success('Account created! Welcome to Agoc Care');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post('/otp/send', { email: form.email, name: form.name });
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend'); }
    setSending(false);
  };

  return (
    <>
      <SeoHead pageKey="register" defaults={{ title: 'Create Account – AgocCare', robots: 'noindex,follow' }} />
      <div className="min-h-[80vh] bg-teal-light flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">

            {/* Logo */}
            <div className="text-center mb-7">
              <Link to="/">
                <img src="/Agoccarelogo.jpeg" alt="AgocCare" className="h-14 w-auto object-contain mx-auto mb-4"/>
              </Link>
              <h1 className="text-2xl font-bold text-teal">
                {step === 1 ? 'Create your account' : 'Verify your email'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {step === 1 ? 'No password needed — OTP login only' : `Enter the OTP sent to ${form.email}`}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {['Your Details', 'Verify Email'].map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${step > i + 1 ? 'bg-cta text-white' : step === i + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold ${step === i + 1 ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name" required className="input"/>
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com" required className="input"/>
                </div>

                <button type="submit" disabled={sending} className="btn-primary w-full py-3 text-sm mt-1">
                  {sending
                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending OTP…</span>
                    : 'Send Verification OTP →'}
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 text-center">
                  OTP sent to <strong>{form.email}</strong>. Check your inbox.
                </div>

                <div>
                  <label className="label text-center block">Enter 6-digit OTP</label>
                  <input value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="● ● ● ● ● ●" maxLength={6} required autoFocus
                    className="input text-center text-2xl font-bold tracking-[0.5em] py-4"/>
                </div>

                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full py-3 text-sm">
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Verifying…</span>
                    : 'Verify & Create Account'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setStep(1); setOtp(''); }}
                    className="text-gray-400 hover:text-teal transition-colors">← Change details</button>
                  <button type="button" onClick={handleResend} disabled={sending}
                    className="text-primary font-semibold hover:underline">
                    {sending ? 'Sending…' : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

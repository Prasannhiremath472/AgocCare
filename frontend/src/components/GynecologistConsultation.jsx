import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, viewport } from '../utils/motion';
import api from '../services/api';

const CONSULTATION_TYPES = [
  'General Gynecology Consultation',
  'Pregnancy & Antenatal Care',
  'PCOD / PCOS Management',
  'Menstrual Disorders',
  'Fertility & Family Planning',
  'Menopause Management',
  'Cervical / Breast Screening',
  'Other / Not Listed',
];

const TIME_SLOTS = [
  '09:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
  '02:00 PM – 03:00 PM',
  '03:00 PM – 04:00 PM',
  '04:00 PM – 05:00 PM',
];

const INITIAL = {
  name: '', phone: '', email: '', age: '',
  consultation_type: '', date: '', time_slot: '', message: '',
};

export default function GynecologistConsultation() {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState('idle'); // idle | submitting | success | error

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.name.trim())               e.name              = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone            = 'Enter a valid 10-digit mobile number';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.age || form.age < 10 || form.age > 100) e.age   = 'Enter age between 10–100';
    if (!form.consultation_type)         e.consultation_type  = 'Please select consultation type';
    if (!form.date)                      e.date               = 'Please select a preferred date';
    if (!form.time_slot)                 e.time_slot          = 'Please select a time slot';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => { const n = { ...er }; delete n[name]; return n; });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus('submitting');
    try {
      await api.post('/consultation/gynecologist', form);
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, children, required }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children ?? (
        <input
          type={type} name={name} value={form[name]} onChange={handleChange}
          placeholder={placeholder}
          min={type === 'date' ? today : undefined}
          className={`rounded-xl border px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition-all
            ${errors[name] ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/25 focus:border-primary'}`}
        />
      )}
      {errors[name] && <p className="text-xs text-red-500 mt-0.5">⚠ {errors[name]}</p>}
    </div>
  );

  return (
    <section className="section bg-gradient-to-br from-[#f0f6ff] via-white to-[#f5fbff] relative overflow-hidden">
      {/* decorative */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Left info panel ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={staggerContainer(0.1)}
            className="space-y-6"
          >
            {/* badge */}
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="text-base">🩺</span> Free Consultation Booking
            </motion.div>

            <motion.h2 variants={fadeUp}
              className="text-3xl md:text-4xl font-black text-primary leading-tight">
              Gynecologist<br/>
              <span className="text-secondary">Consultation</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Book a confidential consultation with our experienced gynecologist.
              We provide expert care for women's health at every stage of life —
              from adolescence to menopause and beyond.
            </motion.p>

            {/* highlights */}
            <motion.div variants={staggerContainer(0.08)} className="space-y-3">
              {[
                { icon:'🔒', label:'100% Confidential',     desc:'Your privacy is our priority' },
                { icon:'⏱️', label:'Quick Response',         desc:'We confirm within 2 hours' },
                { icon:'💊', label:'Medicine Guidance',      desc:'Prescription support available' },
                { icon:'📍', label:'In-Clinic / Tele',       desc:'Choose how you consult' },
              ].map(item => (
                <motion.div key={item.label} variants={fadeUp}
                  className="flex items-start gap-3 bg-white/80 rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-teal">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* contact note */}
            <motion.div variants={fadeUp}
              className="flex items-center gap-3 bg-primary/5 rounded-xl px-4 py-3 border border-primary/15 text-sm text-primary font-semibold">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              For urgent queries call: <span className="ml-1">+91 97667 13777</span>
            </motion.div>
          </motion.div>

          {/* ── Right form ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewport}
            variants={fadeRight}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* form header */}
            <div className="bg-gradient-to-r from-primary to-secondary px-6 py-5 text-white">
              <h3 className="text-lg font-black">Book Your Appointment</h3>
              <p className="text-white/70 text-xs mt-0.5">Fill in the details below — we'll confirm shortly.</p>
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div key="success"
                  initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                  className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-5 shadow-inner">
                    ✅
                  </div>
                  <h4 className="text-xl font-black text-teal mb-2">Appointment Request Sent!</h4>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Thank you! We've received your consultation request and will contact you within 2 hours to confirm your appointment.
                  </p>
                  <button onClick={() => setStatus('idle')}
                    className="mt-6 text-sm text-primary font-bold hover:underline">
                    ← Book Another Appointment
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="px-6 py-5 space-y-4">

                  {/* Row 1: name + phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" name="name" placeholder="Priya Sharma" required />
                    <Field label="Mobile Number" name="phone" type="tel" placeholder="9876543210" required />
                  </div>

                  {/* Row 2: email + age */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email Address" name="email" type="email" placeholder="priya@example.com" />
                    <Field label="Age" name="age" type="number" placeholder="28" required />
                  </div>

                  {/* Row 3: consultation type */}
                  <Field label="Consultation Type" name="consultation_type" required>
                    <select name="consultation_type" value={form.consultation_type} onChange={handleChange}
                      className={`rounded-xl border px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition-all appearance-none
                        ${errors.consultation_type ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/25 focus:border-primary'}`}>
                      <option value="">Select consultation type…</option>
                      {CONSULTATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.consultation_type && <p className="text-xs text-red-500 mt-0.5">⚠ {errors.consultation_type}</p>}
                  </Field>

                  {/* Row 4: date + time */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Preferred Date" name="date" type="date" required />
                    <Field label="Preferred Time Slot" name="time_slot" required>
                      <select name="time_slot" value={form.time_slot} onChange={handleChange}
                        className={`rounded-xl border px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 transition-all appearance-none
                          ${errors.time_slot ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/25 focus:border-primary'}`}>
                        <option value="">Select time…</option>
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.time_slot && <p className="text-xs text-red-500 mt-0.5">⚠ {errors.time_slot}</p>}
                    </Field>
                  </div>

                  {/* Row 5: message */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Symptoms / Message
                    </label>
                    <textarea name="message" value={form.message} onChange={handleChange}
                      placeholder="Briefly describe your symptoms or reason for consultation…"
                      rows={3}
                      className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  {/* error banner */}
                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3 font-semibold">
                      ⚠ Something went wrong. Please try again or call us directly.
                    </div>
                  )}

                  {/* submit */}
                  <motion.button type="submit" disabled={status === 'submitting'}
                    whileHover={{ scale: status === 'submitting' ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {status === 'submitting' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Submitting…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        Book Appointment
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-gray-400">
                    By submitting, you agree to our{' '}
                    <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.
                    Your details are kept strictly confidential.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

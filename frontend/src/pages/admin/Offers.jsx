import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminGetOffers, adminCreateOffer, adminUpdateOffer, adminDeleteOffer } from '../../services/api';
import { imgUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const GRADIENTS = [
  { label: 'Navy → Cyan',   value: 'from-primary to-secondary' },
  { label: 'Cyan → Navy',   value: 'from-secondary to-primary' },
  { label: 'Olive Green',   value: 'from-cta to-cta-dark'      },
  { label: 'Navy → Olive',  value: 'from-primary to-cta'       },
  { label: 'Cyan → Olive',  value: 'from-secondary to-cta'     },
  { label: 'Dark Navy',     value: 'from-primary-dark to-primary' },
];

const EMPTY = { tag:'', title:'', subtitle:'', btn_label:'', btn_url:'/medicines', bg_gradient:'from-primary to-secondary', is_active:1, sort_order:0 };

export default function AdminOffers() {
  const [offers, setOffers]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [image, setImage]       = useState(null);
  const [saving, setSaving]     = useState(false);

  const fetch = () => adminGetOffers().then(r => setOffers(r.data)).catch(() => {});

  useEffect(() => { fetch(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setImage(null); setShowForm(true); };
  const openEdit = o => { setForm({ ...o }); setEditing(o.id); setImage(null); setShowForm(true); };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== undefined && v !== null && fd.append(k, v));
    if (image) fd.append('image', image);
    try {
      editing ? await adminUpdateOffer(editing, fd) : await adminCreateOffer(fd);
      toast.success(editing ? 'Offer updated!' : 'Offer created!');
      setShowForm(false); fetch();
    } catch { toast.error('Failed to save offer'); }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!confirm('Delete this offer?')) return;
    await adminDeleteOffer(id);
    toast.success('Offer deleted');
    fetch();
  };

  const handleToggle = async (o) => {
    const fd = new FormData();
    fd.append('is_active', o.is_active ? 0 : 1);
    await adminUpdateOffer(o.id, fd);
    fetch();
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-teal">Today's Offers</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage promotional banners shown on homepage</p>
        </div>
        <motion.button onClick={openAdd} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          className="btn-primary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          Add Offer
        </motion.button>
      </div>

      {/* Offer cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {offers.map(o => {
          const bg = o.image ? `${import.meta.env.VITE_API_URL?.replace('/api','')||'http://localhost:5000'}${o.image}` : null;
          return (
            <motion.div key={o.id} layout
              className={`relative rounded-2xl bg-gradient-to-br ${o.bg_gradient} p-6 overflow-hidden`}>
              {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20"/>}
              <div className="relative">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded">{o.tag}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleToggle(o)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${o.is_active ? 'bg-green-500/30 text-white' : 'bg-gray-500/30 text-white'}`}>
                      {o.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-extrabold text-lg leading-snug mb-1">{o.title}</h3>
                <p className="text-white/70 text-xs mb-4">{o.subtitle}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(o)}
                    className="text-xs bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(o.id)}
                    className="text-xs bg-red-500/30 hover:bg-red-500/50 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div initial={{ opacity:0, scale:0.92, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.92, y:20 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-teal-light rounded-t-2xl">
                <h2 className="font-black text-teal text-lg">{editing ? 'Edit Offer' : 'Add New Offer'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-white/60 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[
                  ['tag',       'Badge Label (e.g. Limited Deal)',    'text',   true ],
                  ['title',     'Offer Title *',                      'text',   true ],
                  ['subtitle',  'Subtitle / Description',             'text',   false],
                  ['btn_label', 'Button Text *',                      'text',   true ],
                  ['btn_url',   'Button Link (e.g. /medicines) *',    'text',   true ],
                  ['sort_order','Display Order (1 = first)',          'number', false],
                ].map(([k, l, t, r]) => (
                  <div key={k}>
                    <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">{l}</label>
                    <input name={k} type={t} required={r} value={form[k] || ''}
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"/>
                  </div>
                ))}

                {/* Gradient picker */}
                <div>
                  <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">Background Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g.value} type="button"
                        onClick={() => setForm(f => ({ ...f, bg_gradient: g.value }))}
                        className={`h-12 rounded-xl bg-gradient-to-br ${g.value} text-white text-[10px] font-bold border-2 transition-all
                          ${form.bg_gradient === g.value ? 'border-white scale-105 shadow-lg' : 'border-transparent'}`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">
                    Background Image (optional — auto shown on offer card)
                  </label>
                  <div onClick={() => document.getElementById('offer-img').click()}
                    className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-4 text-center cursor-pointer transition-colors">
                    <input id="offer-img" type="file" accept="image/*" className="hidden"
                      onChange={e => setImage(e.target.files[0])}/>
                    {image ? (
                      <p className="text-sm font-semibold text-primary">{image.name}</p>
                    ) : form.image ? (
                      <p className="text-xs text-gray-500">Current: {form.image} · Click to change</p>
                    ) : (
                      <p className="text-xs text-gray-400">Click to upload image (JPG/PNG)</p>
                    )}
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="is_active" checked={!!form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))}
                    className="w-4 h-4 accent-primary cursor-pointer"/>
                  <label htmlFor="is_active" className="text-sm font-semibold text-teal cursor-pointer">Show on website</label>
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 text-sm">
                    {saving ? 'Saving…' : editing ? 'Update Offer' : 'Create Offer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

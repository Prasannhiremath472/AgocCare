import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminGetSeo, adminUpdateSeo } from '../../services/api';
import { invalidateSeoCache } from '../../hooks/useSeo';
import toast from 'react-hot-toast';

const ROBOTS_OPTIONS = [
  'index,follow',
  'noindex,follow',
  'index,nofollow',
  'noindex,nofollow',
];

const FIELD_LIMITS = {
  title: 60, description: 160, keywords: 500,
  og_title: 60, og_description: 200, og_image: 500, canonical: 500,
};

function CharCount({ value = '', max }) {
  const len = (value || '').length;
  const pct = len / max;
  return (
    <span className={`text-[10px] font-mono ${pct > 1 ? 'text-red-500' : pct > 0.85 ? 'text-amber-500' : 'text-gray-400'}`}>
      {len}/{max}
    </span>
  );
}

export default function AdminSeo() {
  const [pages, setPages]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetSeo()
      .then(r => { setPages(r.data); if (r.data.length) selectPage(r.data[0]); })
      .catch(() => toast.error('Failed to load SEO data'))
      .finally(() => setLoading(false));
  }, []);

  const selectPage = (page) => {
    setSelected(page);
    setForm({
      title:          page.title          || '',
      description:    page.description    || '',
      keywords:       page.keywords       || '',
      og_title:       page.og_title       || '',
      og_description: page.og_description || '',
      og_image:       page.og_image       || '',
      canonical:      page.canonical      || '',
      robots:         page.robots         || 'index,follow',
    });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminUpdateSeo(selected.page_key, form);
      invalidateSeoCache(); // Force pages to reload SEO
      toast.success(`SEO updated for "${selected.page_label}"`);
      // Update local list
      setPages(prev => prev.map(p =>
        p.page_key === selected.page_key ? { ...p, ...form } : p
      ));
      setSelected(prev => ({ ...prev, ...form }));
    } catch {
      toast.error('Failed to save SEO');
    }
    setSaving(false);
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-xl font-black text-teal">SEO Management</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage meta title, description and keywords for each page</p>
      </motion.div>

      <div className="grid lg:grid-cols-[260px,1fr] gap-5">
        {/* Page list sidebar */}
        <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Pages</p>
          </div>
          <ul>
            {pages.map(page => (
              <li key={page.page_key}>
                <button
                  onClick={() => selectPage(page)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-50 flex items-center justify-between group ${
                    selected?.page_key === page.page_key
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{page.page_label}</span>
                  {page.title
                    ? <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"/>
                    : <span className="w-2 h-2 rounded-full bg-gray-200 shrink-0"/>
                  }
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Edit form */}
        {selected && (
          <motion.div
            key={selected.page_key}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Form header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-teal-light flex items-center justify-between">
              <div>
                <h2 className="font-black text-teal">{selected.page_label}</h2>
                <p className="text-xs text-gray-400 mt-0.5">page_key: <code className="font-mono">{selected.page_key}</code></p>
              </div>
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
              >
                {saving ? (
                  <motion.span animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"/>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </motion.button>
            </div>

            <div className="p-6 space-y-5">
              {/* Google Preview */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Google Preview</p>
                <p className="text-[#1a0dab] text-lg font-medium leading-tight truncate">
                  {form.title || 'Page Title'}
                </p>
                <p className="text-[#006621] text-xs">agoccarepvtltd.com › {selected.page_key}</p>
                <p className="text-[#545454] text-sm mt-1 line-clamp-2">
                  {form.description || 'Meta description will appear here...'}
                </p>
              </div>

              {/* Basic SEO */}
              <div>
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-3">Basic SEO</p>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Meta Title</label>
                      <CharCount value={form.title} max={FIELD_LIMITS.title} />
                    </div>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => handleChange('title', e.target.value)}
                      placeholder="e.g. Buy Medicines Online – AgocCare"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Recommended: 50–60 characters</p>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Meta Description</label>
                      <CharCount value={form.description} max={FIELD_LIMITS.description} />
                    </div>
                    <textarea
                      value={form.description}
                      onChange={e => handleChange('description', e.target.value)}
                      placeholder="e.g. Order genuine medicines at best prices. Fast delivery across India."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Recommended: 120–160 characters</p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Keywords</label>
                      <CharCount value={form.keywords} max={FIELD_LIMITS.keywords} />
                    </div>
                    <input
                      type="text"
                      value={form.keywords}
                      onChange={e => handleChange('keywords', e.target.value)}
                      placeholder="e.g. buy medicines online, online pharmacy, agoc care"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Comma-separated keywords</p>
                  </div>

                  {/* Robots */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Robots</label>
                    <select
                      value={form.robots}
                      onChange={e => handleChange('robots', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {ROBOTS_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Canonical */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Canonical URL</label>
                    </div>
                    <input
                      type="url"
                      value={form.canonical}
                      onChange={e => handleChange('canonical', e.target.value)}
                      placeholder="e.g. https://agoccarepvtltd.com/"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Open Graph */}
              <div>
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-3">
                  Open Graph (Social Media Preview)
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">OG Title</label>
                      <CharCount value={form.og_title} max={FIELD_LIMITS.og_title} />
                    </div>
                    <input
                      type="text"
                      value={form.og_title}
                      onChange={e => handleChange('og_title', e.target.value)}
                      placeholder="Leave blank to use Meta Title"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">OG Description</label>
                      <CharCount value={form.og_description} max={FIELD_LIMITS.og_description} />
                    </div>
                    <textarea
                      value={form.og_description}
                      onChange={e => handleChange('og_description', e.target.value)}
                      placeholder="Leave blank to use Meta Description"
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">OG Image URL</label>
                    <input
                      type="url"
                      value={form.og_image}
                      onChange={e => handleChange('og_image', e.target.value)}
                      placeholder="e.g. https://agoccarepvtltd.com/og-image.jpg (1200×630px)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Recommended size: 1200×630px</p>
                  </div>
                </div>
              </div>

              {/* Save button bottom */}
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary px-6 py-2.5 text-sm"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

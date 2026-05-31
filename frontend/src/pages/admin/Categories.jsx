import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../services/api';
import toast from 'react-hot-toast';

const slugify = t => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const EMPTY = { name: '', slug: '', image: null };

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [imageFile, setImageFile]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(null);

  const fetchCats = async () => {
    setLoading(true);
    try { const { data } = await adminGetCategories(); setCategories(data); }
    catch { toast.error('Failed to load categories'); }
    setLoading(false);
  };

  useEffect(() => { fetchCats(); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setImageFile(null); setShowForm(true); };
  const openEdit = c  => { setForm({ name: c.name, slug: c.slug, image: c.image || null }); setEditing(c.id); setImageFile(null); setShowForm(true); };

  const handleName = e => {
    const name = e.target.value;
    setForm(f => ({ name, slug: editing ? f.slug : slugify(name) }));
  };

  const handleImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be 2 MB or smaller'); e.target.value = ''; return; }
    setImageFile(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return toast.error('Name and slug are required');
    setSaving(true);
    try {
      const payload = { name: form.name, slug: form.slug };
      if (imageFile) {
        payload.image = await toBase64(imageFile);
      } else if (form.image === null && editing) {
        payload.image = null; // explicitly removed
      } else if (!editing) {
        payload.image = null;
      }
      // if editing and no change to image, don't send image key at all
      editing
        ? await adminUpdateCategory(editing, payload)
        : await adminCreateCategory(payload);
      toast.success(editing ? 'Category updated!' : 'Category created!');
      setShowForm(false);
      fetchCats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    setDeleting(cat.id);
    try {
      await adminDeleteCategory(cat.id);
      toast.success('Category deleted');
      fetchCats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
    setDeleting(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-teal">Categories</h1>
          <p className="text-xs text-gray-400 mt-0.5">{categories.length} categories</p>
        </div>
        <motion.button onClick={openAdd}
          whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          className="btn-primary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          Add Category
        </motion.button>
      </motion.div>

      {/* Grid */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-32 mb-2"/>
              <div className="h-3 bg-gray-100 rounded w-20"/>
            </div>
          ))
        ) : categories.map((cat, i) => (
          <motion.div key={cat.id}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 group hover:border-primary/30 hover:shadow-md transition-all">
            {/* Icon / Image */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-primary/10">
              {cat.image
                ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover"/>
                : '💊'
              }
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-black text-teal truncate">{cat.name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">/{cat.slug}</p>
              <p className="text-xs text-secondary font-semibold mt-1">{cat.product_count} product{cat.product_count !== 1 ? 's' : ''}</p>
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <motion.button onClick={() => openEdit(cat)}
                whileTap={{ scale:0.95 }}
                className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">
                Edit
              </motion.button>
              <motion.button
                onClick={() => handleDelete(cat)}
                disabled={deleting === cat.id || cat.product_count > 0}
                whileTap={{ scale:0.95 }}
                title={cat.product_count > 0 ? `Cannot delete — ${cat.product_count} active products` : 'Delete category'}
                className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {deleting === cat.id ? '…' : 'Delete'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📂</div>
          <p className="font-semibold">No categories yet</p>
          <p className="text-xs mt-1">Click "Add Category" to create your first one</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div
              initial={{ opacity:0, scale:0.92, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.92, y:20 }}
              transition={{ type:'spring', stiffness:300, damping:28 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-teal-light">
                <div>
                  <h2 className="font-black text-teal text-lg">{editing ? '✏️ Edit Category' : '➕ Add Category'}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{editing ? 'Update category name or slug' : 'Create a new product category'}</p>
                </div>
                <motion.button onClick={() => setShowForm(false)}
                  whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
                  className="p-2 rounded-xl hover:bg-white/60 text-gray-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">Category Name *</label>
                  <input value={form.name} onChange={handleName} required placeholder="e.g. Vitamins"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"/>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">URL Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono shrink-0">/medicines?category=</span>
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} required
                      placeholder="vitamins"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal font-mono bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"/>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Auto-generated from name. Only lowercase letters, numbers, hyphens.</p>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">Category Image</label>

                  {/* Show existing image when editing */}
                  {editing && form.image && !imageFile && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-2">
                      <img src={form.image} alt="Current"
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200 shrink-0"/>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-teal">Current Image</p>
                        <p className="text-xs text-gray-400 mt-0.5">Upload below to replace it</p>
                      </div>
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, image: null }))}
                        className="text-xs font-bold text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors shrink-0">
                        Remove
                      </button>
                    </div>
                  )}

                  <div onClick={() => document.getElementById('cat-img-input').click()}
                    className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-4 text-center cursor-pointer transition-colors group">
                    <input id="cat-img-input" type="file" accept="image/*"
                      onChange={handleImageChange} className="hidden"/>
                    {imageFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={URL.createObjectURL(imageFile)} alt="Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"/>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-primary">{imageFile.name}</p>
                          <p className="text-xs text-gray-400">{(imageFile.size/1024).toFixed(0)} KB · Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 group-hover:text-primary transition-colors">
                        {editing && form.image ? 'Click to replace image' : 'Click to upload image'} (JPG, PNG — max 2 MB)
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 mt-2">
                  <motion.button type="button" onClick={() => setShowForm(false)}
                    whileTap={{ scale:0.97 }}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors">
                    Cancel
                  </motion.button>
                  <motion.button type="submit" disabled={saving}
                    whileHover={saving ? {} : { scale:1.02 }} whileTap={saving ? {} : { scale:0.97 }}
                    className="btn-primary px-6 py-2.5 text-sm">
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"/>
                        Saving…
                      </span>
                    ) : (editing ? 'Update Category' : 'Create Category')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

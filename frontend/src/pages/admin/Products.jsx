import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, getCategories } from '../../services/api';
import { formatPrice, imgUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY = { name:'', slug:'', description:'', price:'', mrp:'', stock:'', category_id:'', composition:'', manufacturer:'', expiry_date:'', prescription_required: false };

export default function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [image, setImage]           = useState(null);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetProducts({ page });
      setProducts(data.products); setPages(data.pages); setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [page]);
  useEffect(() => { getCategories().then(r => setCategories(r.data)); }, []);

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setImage(null); setShowForm(true); };
  const openEdit = p => { setForm({ ...p, expiry_date: p.expiry_date?.split('T')[0] || '' }); setEditing(p.id); setImage(null); setShowForm(true); };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // returns "data:image/jpeg;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      // convert empty strings to null for nullable fields
      ['mrp','composition','manufacturer','expiry_date','description'].forEach(k => {
        if (payload[k] === '') payload[k] = null;
      });
      if (image) {
        payload.image = await toBase64(image); // new image selected → convert to base64
      } else if (!form.image) {
        payload.image = null;                  // admin removed existing image
      } else {
        delete payload.image;                  // no change → don't overwrite DB image
      }
      editing ? await adminUpdateProduct(editing, payload) : await adminCreateProduct(payload);
      toast.success(editing ? 'Product updated!' : 'Product created!');
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!confirm('Deactivate this product?')) return;
    await adminDeleteProduct(id).catch(() => {});
    toast.success('Product deactivated');
    fetch();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-teal">Products</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} total products in catalogue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm bg-white text-teal focus:outline-none focus:ring-2 focus:ring-primary shadow-sm w-48"/>
          </div>
          <motion.button onClick={openAdd}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-primary text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            Add Product
          </motion.button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">MRP</th>
                <th className="px-5 py-3.5">Stock</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 rounded w-20"/></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((p, i) => (
                <motion.tr key={p.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-light border border-teal-mid/30 overflow-hidden flex items-center justify-center shrink-0">
                        <img src={imgUrl(p.image)} alt={p.name}
                          className="w-full h-full object-contain p-1"
                          onError={e => { e.target.src = '/placeholder.webp'; }}/>
                      </div>
                      <div>
                        <p className="font-semibold text-teal line-clamp-1 max-w-[160px]">{p.name}</p>
                        {p.prescription_required ? <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">Rx</span> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs font-medium">{p.category}</td>
                  <td className="px-5 py-3.5 font-bold text-teal">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs line-through">{p.mrp ? formatPrice(p.mrp) : '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border
                      ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : p.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {p.stock} {p.stock === 0 ? '(Out)' : 'units'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border
                      ${p.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {p.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button onClick={() => openEdit(p)}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs font-semibold text-primary hover:bg-primary-light px-2.5 py-1.5 rounded-lg transition-colors">
                        Edit
                      </motion.button>
                      <motion.button onClick={() => handleDelete(p.id)}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs font-semibold text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors">
                        Delete
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => (
                <motion.button key={i+1} onClick={() => setPage(i+1)} whileTap={{ scale:0.9 }}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${page===i+1 ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {i+1}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ opacity:0, scale:0.92, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.92, y:20 }}
              transition={{ type:'spring', stiffness:300, damping:28 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-teal-light rounded-t-2xl">
                <div>
                  <h2 className="font-black text-teal text-lg">{editing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{editing ? 'Update product details' : 'Fill in the product information'}</p>
                </div>
                <motion.button onClick={() => setShowForm(false)}
                  whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
                  className="p-2 rounded-xl hover:bg-white/60 text-gray-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[['name','Product Name *','text',true],['slug','URL Slug *','text',true],
                    ['price','Selling Price (₹) *','number',true],['mrp','MRP (₹)','number',false],
                    ['stock','Stock Qty *','number',true],['manufacturer','Manufacturer','text',false],
                    ['composition','Composition / Salt','text',false]].map(([n,l,t,r]) => (
                    <div key={n} className={n === 'composition' || n === 'manufacturer' ? 'col-span-2 sm:col-span-1' : ''}>
                      <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">{l}</label>
                      <input name={n} type={t} step={t==='number'?'0.01':undefined}
                        value={form[n]} onChange={handleChange} required={r}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"/>
                    </div>
                  ))}

                  <div>
                    <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">Category *</label>
                    <select name="category_id" value={form.category_id} onChange={handleChange} required
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                    <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"/>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"/>
                  </div>

                  <div className="flex items-center gap-3 py-1">
                    <input type="checkbox" name="prescription_required" id="rx"
                      checked={form.prescription_required} onChange={handleChange}
                      className="w-4 h-4 accent-primary cursor-pointer"/>
                    <label htmlFor="rx" className="text-sm font-semibold text-teal cursor-pointer">Prescription Required (Rx)</label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">Product Image</label>

                    {/* Show existing DB image when editing and no new image selected */}
                    {editing && form.image && !image && (
                      <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-2">
                        <img src={imgUrl(form.image)} alt="Current"
                          className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white"/>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-teal">Current Image</p>
                          <p className="text-xs text-gray-400 mt-0.5">Select a new image below to replace it</p>
                        </div>
                        <button type="button"
                          onClick={() => setForm(f => ({ ...f, image: null }))}
                          className="text-xs font-bold text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors">
                          Remove
                        </button>
                      </div>
                    )}

                    <div
                      onClick={() => document.getElementById('img-input').click()}
                      className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-5 text-center cursor-pointer transition-colors group">
                      <input id="img-input" type="file" accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error('Image must be 2 MB or smaller');
                            e.target.value = '';
                            return;
                          }
                          setImage(file);
                        }} className="hidden"/>
                      {image ? (
                        <div className="flex items-center justify-center gap-3">
                          <img src={URL.createObjectURL(image)} alt="Preview"
                            className="w-14 h-14 object-contain rounded-lg border border-gray-200"/>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-primary">{image.name}</p>
                            <p className="text-xs text-gray-400">{(image.size / 1024).toFixed(0)} KB · Click to change</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 group-hover:text-primary transition-colors">
                          {editing && form.image ? 'Click to replace image (JPG, PNG — max 2 MB)' : 'Click to upload image (JPG, PNG — max 2 MB)'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-5 border-t border-gray-100 mt-5">
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
                        <motion.span animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"/>
                        Saving…
                      </span>
                    ) : (editing ? 'Update Product' : 'Create Product')}
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

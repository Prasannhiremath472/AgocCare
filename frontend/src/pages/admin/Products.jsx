import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, getCategories,
  adminGetProductImages, adminAddProductImage, adminDeleteProductImage, adminReorderProductImages,
} from '../../services/api';
import { formatPrice, imgUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY = {
  name:'', slug:'', description:'', price:'', mrp:'', stock:'',
  category_id:'', composition:'', manufacturer:'', expiry_date:'',
  prescription_required: false,
};

const calcPrice = (mrp, off) => {
  const m = parseFloat(mrp);
  const o = parseFloat(off);
  if (!m || isNaN(m) || isNaN(o) || off === '' || o < 0 || o >= 100) return '';
  return (m - (m * o / 100)).toFixed(2);
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per image

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Gallery Manager Component ───────────────────────────────────────────────
function GalleryManager({ productId }) {
  const [images, setImages]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetProductImages(productId);
      setImages(data.images || []);
    } catch { toast.error('Failed to load gallery'); }
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleFiles = async (files) => {
    const valid = Array.from(files).filter(f => {
      if (f.size > MAX_IMAGE_SIZE) { toast.error(`${f.name} exceeds 5 MB`); return false; }
      return true;
    });
    if (!valid.length) return;
    setUploading(true);
    for (const file of valid) {
      try {
        const b64 = await toBase64(file);
        await adminAddProductImage(productId, { image_path: b64, sort_order: images.length + 1 });
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    await fetchImages();
    toast.success(`${valid.length} image(s) added`);
    setUploading(false);
  };

  const handleDelete = async (imgId) => {
    if (!confirm('Remove this image?')) return;
    try {
      await adminDeleteProductImage(productId, imgId);
      setImages(prev => prev.filter(i => i.id !== imgId));
      toast.success('Image removed');
    } catch { toast.error('Failed to remove image'); }
  };

  const moveImage = async (index, direction) => {
    const newImages = [...images];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= newImages.length) return;
    [newImages[index], newImages[swapIdx]] = [newImages[swapIdx], newImages[index]];
    const order = newImages.map((img, i) => ({ id: img.id, sort_order: i + 1 }));
    setImages(newImages);
    try {
      await adminReorderProductImages(productId, order);
    } catch { toast.error('Failed to reorder'); fetchImages(); }
  };

  return (
    <div className="space-y-3">
      {/* Upload dropzone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById(`gallery-input-${productId}`).click()}
        className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-4 text-center cursor-pointer transition-colors group"
      >
        <input
          id={`gallery-input-${productId}`}
          type="file" accept="image/*" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"/>
            <span className="text-sm font-semibold">Uploading…</span>
          </div>
        ) : (
          <div className="text-gray-400 group-hover:text-primary transition-colors">
            <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-sm font-semibold">Click or drag & drop images here</p>
            <p className="text-xs mt-0.5">JPG, PNG · Max 5 MB each · Multiple files supported</p>
          </div>
        )}
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-4 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse"/>)}
        </div>
      ) : images.length === 0 ? (
        <p className="text-xs text-center text-gray-400 py-2">No gallery images yet. Upload above.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div key={img.id} className="relative group aspect-square">
              <img
                src={img.image_path}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover rounded-xl border border-gray-200"
              />
              {/* Position badge */}
              <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                {idx === 0 ? '★ Main' : `#${idx + 1}`}
              </div>
              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(idx, -1)}
                    disabled={idx === 0}
                    className="bg-white/90 hover:bg-white text-gray-700 disabled:opacity-30 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    title="Move left"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 1)}
                    disabled={idx === images.length - 1}
                    className="bg-white/90 hover:bg-white text-gray-700 disabled:opacity-30 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    title="Move right"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <p className="text-[10px] text-gray-400">
          First image (★ Main) is shown as the product thumbnail. Hover to reorder or remove.
        </p>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
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
  const [mainImage, setMainImage]   = useState(null); // File for main image
  const [offPercent, setOffPercent] = useState('');   // Discount % helper field
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [activeTab, setActiveTab]   = useState('details'); // 'details' | 'gallery'

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetProducts({ page });
      setProducts(data.products); setPages(data.pages); setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page]);
  useEffect(() => { getCategories().then(r => setCategories(r.data)); }, []);

  const openAdd = () => {
    setForm(EMPTY); setEditing(null); setMainImage(null);
    setOffPercent(''); setActiveTab('details'); setShowForm(true);
  };

  const openEdit = p => {
    setForm({ ...p, expiry_date: p.expiry_date?.split('T')[0] || '' });
    // Compute off% from existing mrp and price
    const off = p.mrp && p.price && p.mrp > p.price
      ? (((p.mrp - p.price) / p.mrp) * 100).toFixed(2)
      : '';
    setOffPercent(off);
    setEditing(p.id); setMainImage(null);
    setActiveTab('details'); setShowForm(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      ['mrp','composition','manufacturer','expiry_date','description'].forEach(k => {
        if (payload[k] === '') payload[k] = null;
      });
      if (mainImage) {
        payload.image = await toBase64(mainImage);
      } else if (!form.image) {
        payload.image = null;
      } else {
        delete payload.image;
      }
      if (editing) {
        await adminUpdateProduct(editing, payload);
        toast.success('Product updated!');
        // Switch to gallery tab for adding images
        setActiveTab('gallery');
        setSaving(false);
        fetchProducts();
        return;
      } else {
        const { data } = await adminCreateProduct(payload);
        toast.success('Product created! Now add gallery images.');
        setEditing(data.id);
        setForm(f => ({ ...f, id: data.id }));
        setActiveTab('gallery');
        setSaving(false);
        fetchProducts();
        return;
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!confirm('Deactivate this product?')) return;
    await adminDeleteProduct(id).catch(() => {});
    toast.success('Product deactivated');
    fetchProducts();
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
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                        {p.image ? (
                          <img src={p.image.startsWith('data:') ? p.image : imgUrl(p.image)}
                            alt={p.name} className="w-full h-full object-contain p-1"
                            onError={e => { e.target.style.display='none'; }}/>
                        ) : (
                          <svg className="w-5 h-5 text-teal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        )}
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-teal-light rounded-t-2xl sticky top-0 z-10">
                <div>
                  <h2 className="font-black text-teal text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{editing ? 'Update product details and manage gallery' : 'Fill in product info, then add gallery images'}</p>
                </div>
                <motion.button onClick={() => setShowForm(false)}
                  whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:0.9 }}
                  className="p-2 rounded-xl hover:bg-white/60 text-gray-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-6 bg-white">
                {[
                  { id: 'details', label: 'Product Details', icon: '📋' },
                  { id: 'gallery', label: 'Gallery Images', icon: '🖼️', disabled: !editing },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors relative ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : tab.disabled
                          ? 'border-transparent text-gray-300 cursor-not-allowed'
                          : 'border-transparent text-gray-500 hover:text-teal hover:border-gray-200'
                    }`}
                  >
                    {tab.icon} {tab.label}
                    {tab.disabled && <span className="text-[10px] ml-1 text-gray-300">(save first)</span>}
                  </button>
                ))}
              </div>

              {/* Tab: Details */}
              {activeTab === 'details' && (
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ['name','Product Name *','text',true],
                      ['slug','URL Slug *','text',true],
                      ['stock','Stock Qty *','number',true],
                      ['manufacturer','Manufacturer','text',false],
                      ['composition','Composition / Salt','text',false],
                    ].map(([n,l,t,r]) => (
                      <div key={n} className={n === 'composition' || n === 'manufacturer' ? 'col-span-2 sm:col-span-1' : ''}>
                        <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">{l}</label>
                        <input name={n} type={t} step={t==='number'?'0.01':undefined}
                          value={form[n]} onChange={handleChange} required={r}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"/>
                      </div>
                    ))}

                    {/* MRP + OFF% + Selling Price — smart linked row */}
                    <div className="col-span-2">
                      <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">Pricing</label>
                      <div className="grid grid-cols-3 gap-3">
                        {/* MRP */}
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">MRP (₹)</label>
                          <input
                            name="mrp" type="number" step="0.01" min="0"
                            placeholder="e.g. 200"
                            value={form.mrp}
                            onChange={e => {
                              const mrp = e.target.value;
                              setForm(f => {
                                const newPrice = calcPrice(mrp, offPercent);
                                return { ...f, mrp, price: newPrice !== '' ? newPrice : f.price };
                              });
                            }}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        {/* OFF % */}
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Discount (%)</label>
                          <div className="relative">
                            <input
                              type="number" step="0.01" min="0" max="99"
                              placeholder="e.g. 15"
                              value={offPercent}
                              onChange={e => {
                                const off = e.target.value;
                                setOffPercent(off);
                                const newPrice = calcPrice(form.mrp, off);
                                if (newPrice !== '') setForm(f => ({ ...f, price: newPrice }));
                              }}
                              className="w-full border border-cta rounded-xl px-3 py-2.5 text-sm text-cta font-bold bg-cta/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cta transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-cta">%</span>
                          </div>
                          {offPercent && parseFloat(offPercent) > 0 && form.mrp && (
                            <p className="text-[10px] text-cta font-semibold mt-1">
                              Save ₹{(parseFloat(form.mrp) * parseFloat(offPercent) / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                        {/* Selling Price */}
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Selling Price (₹) *</label>
                          <input
                            name="price" type="number" step="0.01" min="0" required
                            placeholder="Auto or manual"
                            value={form.price}
                            onChange={e => {
                              const price = e.target.value;
                              setForm(f => ({ ...f, price }));
                              // Recalculate off% if mrp is set
                              if (form.mrp && price) {
                                const off = (((parseFloat(form.mrp) - parseFloat(price)) / parseFloat(form.mrp)) * 100).toFixed(2);
                                setOffPercent(off > 0 ? off : '');
                              }
                            }}
                            className="w-full border border-primary rounded-xl px-3 py-2.5 text-sm text-primary font-bold bg-primary/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                          {form.mrp && form.price && parseFloat(form.mrp) > parseFloat(form.price) && (
                            <p className="text-[10px] text-primary font-semibold mt-1">
                              {(((parseFloat(form.mrp) - parseFloat(form.price)) / parseFloat(form.mrp)) * 100).toFixed(0)}% off MRP
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

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
                      <textarea name="description" value={form.description || ''} onChange={handleChange} rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-teal bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"/>
                    </div>

                    <div className="flex items-center gap-3 py-1">
                      <input type="checkbox" name="prescription_required" id="rx"
                        checked={form.prescription_required} onChange={handleChange}
                        className="w-4 h-4 accent-primary cursor-pointer"/>
                      <label htmlFor="rx" className="text-sm font-semibold text-teal cursor-pointer">Prescription Required (Rx)</label>
                    </div>

                    {/* Main product image */}
                    <div className="col-span-2">
                      <label className="block text-[11px] font-black text-gray-500 mb-1.5 uppercase tracking-wider">
                        Main Product Image
                        <span className="ml-1 font-normal text-gray-400 normal-case">(also manageable from Gallery tab)</span>
                      </label>
                      {editing && form.image && !mainImage && (
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-2">
                          <img src={form.image.startsWith('data:') ? form.image : imgUrl(form.image)}
                            alt="Current" className="w-14 h-14 object-contain rounded-lg border border-gray-200 bg-white shrink-0"/>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-teal">Current Main Image</p>
                            <p className="text-xs text-gray-400 mt-0.5">Upload a new image to replace, or manage all images in Gallery tab</p>
                          </div>
                          <button type="button" onClick={() => setForm(f => ({ ...f, image: null }))}
                            className="text-xs font-bold text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors shrink-0">
                            Remove
                          </button>
                        </div>
                      )}
                      <div
                        onClick={() => document.getElementById('main-img-input').click()}
                        className="border-2 border-dashed border-gray-200 hover:border-primary rounded-xl p-4 text-center cursor-pointer transition-colors group">
                        <input id="main-img-input" type="file" accept="image/*"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > MAX_IMAGE_SIZE) { toast.error('Image must be 5 MB or smaller'); e.target.value = ''; return; }
                            setMainImage(file);
                          }} className="hidden"/>
                        {mainImage ? (
                          <div className="flex items-center justify-center gap-3">
                            <img src={URL.createObjectURL(mainImage)} alt="Preview"
                              className="w-14 h-14 object-contain rounded-lg border border-gray-200"/>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-primary">{mainImage.name}</p>
                              <p className="text-xs text-gray-400">{(mainImage.size / 1024).toFixed(0)} KB · Click to change</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 group-hover:text-primary transition-colors">
                            Click to upload main image (JPG, PNG — max 5 MB)
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
                      ) : editing ? 'Save & Go to Gallery →' : 'Create & Add Images →'}
                    </motion.button>
                  </div>
                </form>
              )}

              {/* Tab: Gallery */}
              {activeTab === 'gallery' && editing && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-teal">Gallery Images</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Upload multiple images. First image becomes the main product thumbnail.</p>
                    </div>
                  </div>
                  <GalleryManager productId={editing} />
                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <motion.button type="button" onClick={() => { setShowForm(false); fetchProducts(); }}
                      whileTap={{ scale:0.97 }}
                      className="btn-primary px-6 py-2.5 text-sm">
                      Done
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

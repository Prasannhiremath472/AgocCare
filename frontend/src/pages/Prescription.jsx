import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { extractPrescription } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { formatPrice, imgUrl, discount } from '../utils/helpers';
import { staggerContainer, staggerItem, fadeUp, scaleIn } from '../utils/motion';
import toast from 'react-hot-toast';

export default function Prescription() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const addItem  = useCartStore(s => s.addItem);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(f.type)) {
      toast.error('Please upload a JPG or PNG image of your prescription', { duration: 4000 });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB');
      return;
    }
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
    toast.success('Prescription uploaded! Click Extract to analyse.');
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleExtract = async () => {
    if (!file) return toast.error('Please upload a prescription first');
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('prescription', file);
      const { data } = await extractPrescription(fd);
      setResult(data);
      if (data.medicines?.length === 0) {
        toast.error('No medicines found. Try a clearer image.');
      } else {
        toast.success(`Found ${data.medicines.length} medicine${data.medicines.length > 1 ? 's' : ''} in prescription!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Extraction failed. Please try again.');
    }
    setLoading(false);
  };

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success(`${product.name} added to cart!`, { icon: '💊' });
  };

  const handleAddAll = () => {
    let count = 0;
    result?.matched_products?.forEach(({ products }) => {
      if (products?.[0]) { addItem(products[0]); count++; }
    });
    if (count) toast.success(`${count} medicines added to cart!`, { icon: '🛒' });
  };

  const reset = () => {
    setFile(null); setPreview(null); setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <Helmet>
        <title>Prescription Extractor | Agoc Care</title>
        <meta name="description" content="Upload your prescription and we'll find the medicines for you automatically." />
      </Helmet>

      <div className="bg-teal-light min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Header */}
          <motion.div
            className="text-center mb-10"
            variants={staggerContainer(0.1)} initial="hidden" animate="visible"
          >
            <motion.div variants={scaleIn}
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-btn">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-teal mb-2">
              Prescription Extractor
            </motion.h1>
            <motion.p variants={fadeUp} className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Upload your doctor's prescription — our AI will read it and find matching medicines for you instantly.
            </motion.p>
          </motion.div>

          {/* How it works */}
          <motion.div
            className="grid grid-cols-3 gap-4 mb-8"
            variants={staggerContainer(0.1)} initial="hidden" animate="visible"
          >
            {[
              { num:'01', title:'Upload Prescription', sub:'Photo or PDF of your prescription', icon:'📄' },
              { num:'02', title:'AI Reads It',         sub:'Gemini AI extracts all medicines',  icon:'🤖' },
              { num:'03', title:'Add to Cart',         sub:'Find & order medicines in 1 click', icon:'🛒' },
            ].map(s => (
              <motion.div key={s.num} variants={staggerItem}
                className="bg-white rounded-2xl p-4 text-center border border-teal-mid/30 shadow-sm">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-xs font-black text-primary/30 mb-1">{s.num}</div>
                <h3 className="text-sm font-bold text-teal mb-0.5">{s.title}</h3>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Upload zone */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => !file && inputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
                ${dragOver
                  ? 'border-primary bg-primary-light scale-[1.01]'
                  : file
                  ? 'border-cta bg-cta-light cursor-default'
                  : 'border-teal-mid/60 bg-white hover:border-primary hover:bg-primary-light/30'
                }`}
            >
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={e => handleFile(e.target.files[0])} className="hidden"/>

              {/* No file yet */}
              {!file && (
                <div className="py-16 flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center"
                  >
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                  </motion.div>
                  <div className="text-center">
                    <p className="font-semibold text-teal">Drop your prescription here</p>
                    <p className="text-sm text-gray-400 mt-0.5">or click to browse · JPG or PNG image only · Max 10MB</p>
                  </div>
                </div>
              )}

              {/* File selected */}
              {file && (
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    {preview ? (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-cta/20 shrink-0">
                        <img src={preview} alt="prescription" className="w-full h-full object-cover"/>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-cta-light rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-10 h-10 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-cta shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm font-semibold text-teal truncate">{file.name}</span>
                      </div>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · Ready to extract</p>
                      <button onClick={e => { e.stopPropagation(); reset(); }}
                        className="text-xs text-red-400 hover:text-red-600 hover:underline mt-2 transition-colors">
                        Remove file
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Extract button */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-8">
            <motion.button
              onClick={handleExtract}
              disabled={!file || loading}
              whileHover={!file || loading ? {} : { scale: 1.03 }}
              whileTap={!file || loading  ? {} : { scale: 0.97 }}
              className="btn-primary px-10 py-3.5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <motion.span
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block"
                  />
                  AI is reading your prescription…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  Extract Medicines with AI
                </span>
              )}
            </motion.button>
            <p className="text-xs text-gray-400 mt-2">Powered by Google Gemini Vision AI</p>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Extracted medicines summary */}
                {result.medicines?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-teal-mid/30 p-5 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <div>
                        <h2 className="font-bold text-teal text-lg">
                          {result.medicines.length} Medicine{result.medicines.length > 1 ? 's' : ''} Found
                        </h2>
                        <p className="text-xs text-gray-400">Extracted from your prescription</p>
                      </div>
                      <motion.button
                        onClick={handleAddAll}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className="btn-cta text-sm px-5 py-2"
                      >
                        🛒 Add All to Cart
                      </motion.button>
                    </div>

                    {/* Extracted list */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.medicines.map((med, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.07 }}
                          className="bg-primary-light border border-primary/20 rounded-xl px-3 py-1.5"
                        >
                          <p className="text-xs font-bold text-primary">{med.name}</p>
                          {med.dosage    && <p className="text-[10px] text-gray-500">{med.dosage}</p>}
                          {med.frequency && <p className="text-[10px] text-gray-400">{med.frequency}</p>}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched products */}
                {result.matched_products?.length > 0 && (
                  <div className="space-y-5">
                    <h2 className="font-bold text-teal text-lg">Matching Products in Our Store</h2>
                    {result.matched_products.map((group, gi) => (
                      <motion.div
                        key={gi}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: gi * 0.1 }}
                        className="bg-white rounded-2xl border border-teal-mid/30 shadow-sm overflow-hidden"
                      >
                        {/* Group header */}
                        <div className="bg-teal-light px-5 py-3 flex items-center gap-2 border-b border-teal-mid/30">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                          </svg>
                          <span className="text-sm font-bold text-teal">
                            {group.extracted.name}
                            {group.extracted.dosage && <span className="text-gray-400 font-normal ml-1">· {group.extracted.dosage}</span>}
                          </span>
                          {group.products.length === 0 && (
                            <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Not found in store</span>
                          )}
                        </div>

                        {group.products.length === 0 ? (
                          <div className="px-5 py-4 text-sm text-gray-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
                            </svg>
                            No matching product found.{' '}
                            <Link to="/medicines" className="text-primary hover:underline">Browse all medicines</Link>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {group.products.map((product, pi) => {
                              const disc = discount(product.price, product.mrp);
                              return (
                                <motion.div
                                  key={product.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: gi * 0.1 + pi * 0.06 }}
                                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors"
                                >
                                  {/* Image */}
                                  <Link to={`/medicines/${product.slug}`}
                                    className="w-14 h-14 rounded-xl bg-teal-light border border-teal-mid/30 overflow-hidden shrink-0 flex items-center justify-center">
                                    <img src={imgUrl(product.image)} alt={product.name}
                                      className="w-full h-full object-contain p-1.5"
                                      onError={e => { e.target.src = '/placeholder.webp'; }}/>
                                  </Link>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <Link to={`/medicines/${product.slug}`}
                                      className="text-sm font-semibold text-teal hover:text-primary transition-colors line-clamp-1">
                                      {product.name}
                                    </Link>
                                    <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="font-bold text-teal">{formatPrice(product.price)}</span>
                                      {disc > 0 && (
                                        <>
                                          <span className="text-xs text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                                          <span className="badge-off text-[10px]">{disc}% OFF</span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action */}
                                  <div className="shrink-0">
                                    {product.stock > 0 ? (
                                      <motion.button
                                        onClick={() => handleAddToCart(product)}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="btn-primary text-xs px-4 py-2"
                                      >
                                        + Add to Cart
                                      </motion.button>
                                    ) : (
                                      <span className="badge-oos text-xs">Out of Stock</span>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* No results */}
                {result.medicines?.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-10 text-center border border-teal-mid/30 shadow-sm">
                    <div className="text-5xl mb-3">🔍</div>
                    <h3 className="font-bold text-teal mb-1">No medicines detected</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      The AI couldn't read the prescription clearly. Please try:<br/>
                      · A clearer, well-lit photo · Make sure text is in focus · Avoid shadows
                    </p>
                    <button onClick={reset} className="btn-outline text-sm">Try Again</button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          <motion.p variants={fadeUp} initial="hidden" animate="visible"
            className="text-center text-xs text-gray-400 mt-8 max-w-lg mx-auto leading-relaxed">
            ⚕️ This tool assists in finding medicines from your prescription. Always consult your doctor before purchasing prescription medicines. Prescription medicines (Rx) require a valid prescription.
          </motion.p>
        </div>
      </div>
    </>
  );
}

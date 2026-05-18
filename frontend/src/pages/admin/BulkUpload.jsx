import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminBulkUpload } from '../../services/api';
import toast from 'react-hot-toast';

export default function BulkUpload() {
  const [excel, setExcel]     = useState(null);
  const [zip, setZip]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [progress, setProgress] = useState(0);
  const excelRef = useRef();
  const zipRef   = useRef();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!excel) return toast.error('Please select an Excel file');
    setLoading(true);
    setResult(null);
    setProgress(10);

    const fd = new FormData();
    fd.append('excel', excel);
    if (zip) fd.append('images', zip);

    try {
      setProgress(30);
      const { data } = await adminBulkUpload(fd);
      setProgress(100);
      setResult(data);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    const headers = [
      'name', 'slug', 'category', 'price', 'mrp', 'stock',
      'composition', 'prescription', 'description', 'manufacturer', 'expiry'
    ];
    const sample = [
      'Agoc-SP Tablets', 'agoc-sp-tablets', 'Tablets', 350, 420, 100,
      'Aceclofenac 100mg + Paracetamol 325mg', 'Yes',
      'Used for pain and inflammation', 'Agoc Care Pvt. Ltd.', '12/2026'
    ];
    const csv = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'AgocCare_Bulk_Upload_Template.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-teal">Bulk Product Upload</h1>
        <p className="text-xs text-gray-400 mt-0.5">Upload multiple products at once using Excel + Images ZIP</p>
      </div>

      {/* Instructions */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-5">
        <h2 className="font-bold text-teal mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          How to use
        </h2>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>Download the Excel template below and fill in product details</li>
          <li>Name your product images as <code className="bg-gray-100 px-1 rounded">product-slug.jpg</code> or <code className="bg-gray-100 px-1 rounded">product-slug-1.jpg</code>, <code className="bg-gray-100 px-1 rounded">product-slug-2.jpg</code> for multiple images</li>
          <li>Put all images into a single ZIP file</li>
          <li>Upload both the Excel and ZIP files below</li>
        </ol>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            ['Category values', 'tablets, syrups, capsules, injections, vitamins'],
            ['Prescription', 'Yes or No'],
            ['Expiry format', 'MM/YYYY (e.g. 12/2026)'],
            ['Image formats', 'JPG, PNG, WEBP'],
          ].map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl p-3 border border-teal-mid/30">
              <p className="font-bold text-teal mb-1">{k}</p>
              <p className="text-gray-500">{v}</p>
            </div>
          ))}
        </div>

        <button onClick={downloadTemplate}
          className="mt-4 inline-flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary-dark transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Download Excel Template
        </button>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-teal-mid/30 shadow-card p-6 space-y-5">
        <h2 className="font-bold text-teal text-lg">Upload Files</h2>

        {/* Excel */}
        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">
            Excel / CSV File * <span className="text-gray-400 normal-case font-normal">(required)</span>
          </label>
          <div onClick={() => excelRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
              ${excel ? 'border-cta bg-cta-light' : 'border-gray-200 hover:border-primary bg-gray-50'}`}>
            <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={e => setExcel(e.target.files[0])}/>
            {excel ? (
              <div className="flex items-center justify-center gap-2 text-cta-dark">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-semibold">{excel.name}</span>
                <span className="text-xs text-gray-500">({(excel.size/1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p className="text-sm font-semibold text-gray-500">Click to select Excel / CSV file</p>
                <p className="text-xs text-gray-400 mt-1">.xlsx, .xls, .csv supported</p>
              </div>
            )}
          </div>
        </div>

        {/* ZIP Images */}
        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">
            Images ZIP File <span className="text-gray-400 normal-case font-normal">(optional)</span>
          </label>
          <div onClick={() => zipRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
              ${zip ? 'border-secondary bg-secondary/10' : 'border-gray-200 hover:border-secondary bg-gray-50'}`}>
            <input ref={zipRef} type="file" accept=".zip" className="hidden"
              onChange={e => setZip(e.target.files[0])}/>
            {zip ? (
              <div className="flex items-center justify-center gap-2 text-secondary-dark">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-semibold">{zip.name}</span>
                <span className="text-xs text-gray-500">({(zip.size/1024/1024).toFixed(2)} MB)</span>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p className="text-sm font-semibold text-gray-500">Click to select ZIP file with product images</p>
                <p className="text-xs text-gray-400 mt-1">Max 100MB · .zip format only</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Uploading and processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}/>
            </div>
          </div>
        )}

        <motion.button type="submit" disabled={loading || !excel}
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.97 }}
          className="btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              Processing... Please wait
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              Upload & Import Products
            </span>
          )}
        </motion.button>
      </form>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="space-y-4">

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label:'Total Rows', value: result.total, color:'text-teal', bg:'bg-teal-light' },
                { label:'Successful', value: result.success.length, color:'text-green-600', bg:'bg-green-50' },
                { label:'Failed', value: result.failed.length, color:'text-red-500', bg:'bg-red-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border border-teal-mid/20`}>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Success list */}
            {result.success.length > 0 && (
              <div className="bg-white rounded-2xl border border-green-100 shadow-card overflow-hidden">
                <div className="bg-green-50 px-5 py-3 border-b border-green-100">
                  <h3 className="font-bold text-green-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    Successfully Imported ({result.success.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {result.success.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-teal">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.slug} · ID: {p.productId}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-lg">
                        {p.images} image{p.images !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed list */}
            {result.failed.length > 0 && (
              <div className="bg-white rounded-2xl border border-red-100 shadow-card overflow-hidden">
                <div className="bg-red-50 px-5 py-3 border-b border-red-100">
                  <h3 className="font-bold text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Failed ({result.failed.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                  {result.failed.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <p className="text-sm font-semibold text-teal">{p.name}</p>
                      <p className="text-xs text-red-500">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

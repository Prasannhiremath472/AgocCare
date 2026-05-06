import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getProduct } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { formatPrice, discount, imgUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    setLoading(true);
    getProduct(slug).then(r => { setProduct(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div className="text-center py-20"><h2 className="text-xl">Product not found</h2><Link to="/medicines" className="text-primary">Browse all medicines</Link></div>;

  const disc = discount(product.price, product.mrp);

  return (
    <>
      <Helmet>
        <title>{product.name} | Agoc Care</title>
        <meta name="description" content={product.description || `Buy ${product.name} online at best price.`} />
        <link rel="canonical" href={`/medicines/${product.slug}`} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link> &rsaquo;{' '}
          <Link to="/medicines" className="hover:text-primary">Medicines</Link> &rsaquo;{' '}
          <Link to={`/medicines?category=${product.category_slug}`} className="hover:text-primary">{product.category}</Link> &rsaquo;{' '}
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6 flex items-center justify-center aspect-square">
            <img src={imgUrl(product.image)} alt={product.name} className="max-h-72 object-contain" onError={e => { e.target.src = '/placeholder.webp'; }} />
          </div>

          <div>
            {product.prescription_required && <span className="badge-rx mb-2 inline-block">Prescription Required</span>}
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{product.category} &bull; {product.manufacturer}</p>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {disc > 0 && (
                <>
                  <span className="text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                  <span className="bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded font-medium">{disc}% OFF</span>
                </>
              )}
            </div>

            <p className={`text-sm mt-2 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
            </p>

            {product.stock > 0 && (
              <div className="flex items-center gap-3 mt-6">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 font-bold">−</button>
                  <span className="px-4 py-2 font-medium">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 font-bold">+</button>
                </div>
                <button
                  onClick={() => { addItem(product, qty); toast.success('Added to cart!'); }}
                  className="btn-primary flex-1"
                >
                  Add to Cart
                </button>
              </div>
            )}

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              {product.composition && <p><strong>Composition:</strong> {product.composition}</p>}
              {product.manufacturer && <p><strong>Manufacturer:</strong> {product.manufacturer}</p>}
              {product.expiry_date && <p><strong>Expires:</strong> {new Date(product.expiry_date).toLocaleDateString('en-IN')}</p>}
            </div>
          </div>
        </div>

        {product.description && (
          <div className="card p-6 mt-8">
            <h2 className="font-bold text-lg mb-3">Product Description</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    </>
  );
}

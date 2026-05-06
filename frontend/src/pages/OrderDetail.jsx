import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getOrder } from '../services/api';
import { formatPrice, imgUrl } from '../utils/helpers';

const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(r => { setOrder(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="text-center py-20">Order not found. <Link to="/orders" className="text-primary">Back to orders</Link></div>;

  const stepIdx = STATUS_STEPS.indexOf(order.status);
  const address = (() => { try { return JSON.parse(order.shipping_address); } catch { return order.shipping_address; } })();

  return (
    <>
      <Helmet><title>{`Order #${order.id} | Agoc Care`}</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="text-gray-500 hover:text-primary">← Orders</Link>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        </div>

        {/* Progress Stepper */}
        {order.status !== 'cancelled' && (
          <div className="card p-6 mb-6 overflow-hidden">
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  {/* Circle + label */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                      ${i <= stepIdx ? 'bg-primary text-white shadow-btn' : 'bg-gray-100 text-gray-400'}`}>
                      {i < stepIdx
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        : i + 1
                      }
                    </div>
                    <span className={`text-[11px] font-medium capitalize hidden sm:block whitespace-nowrap
                      ${i <= stepIdx ? 'text-primary' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                  {/* Connector line — flex-1, NOT absolute */}
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors
                      ${i < stepIdx ? 'bg-primary' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h2 className="font-bold mb-4">Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={imgUrl(item.image)} alt={item.name} className="w-12 h-12 object-contain flex-shrink-0" onError={e => { e.target.src = '/placeholder.webp'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <p className="font-medium text-sm">{formatPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold mb-3">Shipping Address</h2>
              {typeof address === 'object' ? (
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p className="font-medium text-gray-800">{address.name}</p>
                  <p>{address.phone}</p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                </div>
              ) : <p className="text-sm text-gray-600">{address}</p>}
            </div>
            <div className="card p-5">
              <h2 className="font-bold mb-3">Payment</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Status: <span className="font-medium text-gray-800 capitalize">{order.status}</span></p>
                {order.razorpay_payment_id && <p className="truncate">ID: {order.razorpay_payment_id}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
});

api.interceptors.request.use(config => {
  const auth = JSON.parse(localStorage.getItem('medico-auth') || '{}');
  const token = auth?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('medico-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (slug) => api.get(`/products/${slug}`);
export const getFeatured = () => api.get('/products/featured');
export const getCategories = () => api.get('/categories');

export const loginSendOTP   = (data) => api.post('/auth/login/send-otp', data);
export const loginVerifyOTP = (data) => api.post('/auth/login/verify-otp', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

export const createOrder = (data) => api.post('/orders', data);
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);

export const createPaymentOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment = (data) => api.post('/payment/verify', data);

export const adminGetProducts = (params) => api.get('/admin/products', { params });
export const adminCreateProduct = (data) => api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateProduct = (id, data) => api.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const adminGetOrders = (params) => api.get('/admin/orders', { params });
export const adminUpdateOrder = (id, data) => api.put(`/admin/orders/${id}/status`, data);
export const adminGetUsers = () => api.get('/admin/users');
export const adminDashboard = () => api.get('/admin/dashboard');
export const adminCreateCategory = (data) => api.post('/admin/categories', data);

export const getAnalytics = () => api.get('/analytics');

export const getOffers = () => api.get('/offers');
export const adminGetOffers = () => api.get('/offers/all');
export const adminCreateOffer = (data) => api.post('/offers', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateOffer = (id, data) => api.put(`/offers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteOffer = (id) => api.delete(`/offers/${id}`);

export const extractPrescription = (formData) =>
  api.post('/prescription/extract', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

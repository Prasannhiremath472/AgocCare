export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price);

export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const imgUrl = (path) => {
  if (!path) return '/placeholder.webp';
  if (path.startsWith('http')) return path;
  // path from DB is already "/uploads/filename.png" — just prepend the base URL
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

export const discount = (price, mrp) => mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

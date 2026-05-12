export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price);

export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Images are served from frontend domain (public_html/uploads/) in production
// and from backend (localhost:5000/uploads/) in development
const imageBase = () => {
  if (import.meta.env.VITE_IMAGE_URL) return import.meta.env.VITE_IMAGE_URL;
  if (import.meta.env.PROD) return '';  // same domain as frontend in production
  return 'http://localhost:5000';       // backend in development
};

export const imgUrl = (path) => {
  if (!path) return '/placeholder.webp';
  if (path.startsWith('http')) return path;
  return `${imageBase()}${path.startsWith('/') ? path : '/' + path}`;
};

export const galleryUrl = (path) => {
  if (!path) return '/placeholder.webp';
  if (path.startsWith('http')) return path;
  return `${imageBase()}${path.startsWith('/') ? path : '/' + path}`;
};

export const discount = (price, mrp) => mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

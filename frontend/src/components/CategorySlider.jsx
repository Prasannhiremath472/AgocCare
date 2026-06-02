import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const BG_COLORS = ['bg-blue-50','bg-purple-50','bg-red-50','bg-yellow-50','bg-green-50','bg-pink-50','bg-indigo-50','bg-orange-50'];

const getCategoryImage = (cat) => {
  if (!cat.image) return null;
  // Already base64
  if (cat.image.startsWith('data:')) return cat.image;
  // Absolute URL
  if (cat.image.startsWith('http')) return cat.image;
  // Relative path
  const base = import.meta.env.VITE_IMAGE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
  return `${base}/${cat.image.replace(/^\//, '')}`;
};

export default function CategorySlider({ categories = [] }) {
  if (!categories.length) return (
    <div className="flex gap-6">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 flex-1">
          <div className="skeleton w-36 h-36 rounded-full mx-auto" />
          <div className="skeleton h-3 w-16 rounded mx-auto" />
        </div>
      ))}
    </div>
  );

  const slides = [...categories, ...categories, ...categories];

  return (
    <Swiper
      modules={[Autoplay]}
      loop={true}
      speed={3000}
      autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
      allowTouchMove={true}
      breakpoints={{
        0:    { slidesPerView: 3, spaceBetween: 16 },
        480:  { slidesPerView: 4, spaceBetween: 20 },
        768:  { slidesPerView: 5, spaceBetween: 24 },
        1024: { slidesPerView: 6, spaceBetween: 28 },
        1280: { slidesPerView: 7, spaceBetween: 32 },
      }}
      className="!overflow-hidden category-swiper"
    >
      {slides.map((cat, i) => {
        const imgSrc = getCategoryImage(cat);
        const bg = BG_COLORS[cat.id % BG_COLORS.length] || 'bg-gray-50';
        return (
          <SwiperSlide key={`${cat.id}-${i}`}>
            <Link to={`/medicines?category=${cat.slug}`}>
              <motion.div
                className="flex flex-col items-center gap-3 py-3 cursor-pointer"
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                {/* Circle image */}
                <motion.div
                  className={`w-36 h-36 rounded-full mx-auto overflow-hidden ${bg} border-4 border-white shadow-md flex items-center justify-center`}
                  whileHover={{ scale: 1.08, boxShadow: '0 8px 24px rgba(4,75,153,0.18)' }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-4xl">💊</span>
                  )}
                </motion.div>

                {/* Label */}
                <span className="text-[13px] font-bold text-teal text-center leading-tight hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </motion.div>
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

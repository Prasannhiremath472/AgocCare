import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';

const CATEGORIES_META = {
  tablets:    { image: `${BASE}/uploads/1T%20FOL%20MD%20Tab/1.jpg`,      bg: 'bg-blue-50'   },
  capsules:   { image: `${BASE}/uploads/Folok%20DHA/1.png`,              bg: 'bg-purple-50' },
  injections: { image: `${BASE}/uploads/Endohope%20AQ%2050mg/1.png`,     bg: 'bg-red-50'    },
  vitamins:   { image: `${BASE}/uploads/AFC%20Boost/1.jpg`,              bg: 'bg-yellow-50' },
};

const DEFAULT = { image: `${BASE}/uploads/1T%20FOL%20MD%20Tab/1.jpg`, bg: 'bg-gray-50' };

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
        const meta = CATEGORIES_META[cat.slug] || DEFAULT;
        return (
          <SwiperSlide key={`${cat.id}-${i}`}>
            <Link to={`/medicines?category=${cat.slug}`}>
              <motion.div
                className="flex flex-col items-center gap-3 py-3 cursor-pointer"
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                        {/* Circle image */}
                <motion.div
                  className={`w-36 h-36 rounded-full mx-auto overflow-hidden ${meta.bg}
                              border-4 border-white shadow-md relative`}
                  whileHover={{ scale: 1.08, boxShadow: '0 8px 24px rgba(4,75,153,0.18)' }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                >
                  <img
                    src={meta.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
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

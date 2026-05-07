import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const CATEGORIES_META = {
  tablets: {
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&q=80',
    bg: 'bg-blue-50',
  },
  syrups: {
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&q=80',
    bg: 'bg-amber-50',
  },
  capsules: {
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&q=80',
    bg: 'bg-purple-50',
  },
  injections: {
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80',
    bg: 'bg-red-50',
  },
  vitamins: {
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80',
    bg: 'bg-yellow-50',
  },
  skincare: {
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&q=80',
    bg: 'bg-green-50',
  },
  'medical-devices': {
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&q=80',
    bg: 'bg-teal-50',
  },
};

const DEFAULT = {
  image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&q=80',
  bg: 'bg-gray-50',
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
                  className={`w-36 h-36 rounded-full ${meta.bg} mx-auto overflow-hidden
                              border-2 border-transparent hover:border-primary
                              shadow-md transition-all duration-200 relative`}
                  whileHover={{ scale: 1.08, boxShadow: '0 8px 24px rgba(26,58,107,0.18)' }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                >
                  <img
                    src={meta.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Hover tint */}
                  <div className="absolute inset-0 bg-primary/0 hover:bg-primary/10 transition-colors duration-200 rounded-full" />
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

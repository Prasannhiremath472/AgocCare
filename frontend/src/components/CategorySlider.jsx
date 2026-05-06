import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const CATEGORIES_META = {
  tablets:           { icon: '💊', gradient: 'from-blue-500   to-blue-600'   },
  syrups:            { icon: '🍶', gradient: 'from-amber-500  to-amber-600'  },
  capsules:          { icon: '💉', gradient: 'from-purple-500 to-purple-600' },
  injections:        { icon: '🩺', gradient: 'from-red-500    to-red-600'    },
  vitamins:          { icon: '⚡', gradient: 'from-yellow-500 to-yellow-600' },
  skincare:          { icon: '🌿', gradient: 'from-green-500  to-green-600'  },
  'medical-devices': { icon: '🔬', gradient: 'from-teal-500   to-teal-600'   },
};

export default function CategorySlider({ categories = [] }) {
  if (!categories.length) return (
    <div className="flex gap-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 flex-1">
          <div className="skeleton w-[88px] h-[88px] rounded-2xl mx-auto"/>
          <div className="skeleton h-3 w-16 rounded mx-auto"/>
        </div>
      ))}
    </div>
  );

  // Duplicate slides for seamless infinite loop
  const slides = [...categories, ...categories, ...categories];

  return (
    <Swiper
      modules={[Autoplay]}
      slidesPerView={5}
      spaceBetween={20}
      loop={true}
      speed={3000}
      autoplay={{
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      allowTouchMove={true}
      breakpoints={{
        0:    { slidesPerView: 3, spaceBetween: 12 },
        480:  { slidesPerView: 4, spaceBetween: 14 },
        768:  { slidesPerView: 5, spaceBetween: 18 },
        1024: { slidesPerView: 5, spaceBetween: 22 },
        1280: { slidesPerView: 6, spaceBetween: 24 },
      }}
      className="!overflow-hidden category-swiper"
    >
      {slides.map((cat, i) => {
        const meta = CATEGORIES_META[cat.slug] || {
          icon: '💊', gradient: 'from-primary to-primary-dark',
        };

        return (
          <SwiperSlide key={`${cat.id}-${i}`}>
            <Link to={`/medicines?category=${cat.slug}`}>
              <motion.div
                className="flex flex-col items-center gap-3 cursor-pointer py-2"
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                {/* Icon */}
                <motion.div
                  className={`w-[88px] h-[88px] rounded-2xl bg-gradient-to-br ${meta.gradient}
                              flex items-center justify-center shadow-md mx-auto relative overflow-hidden`}
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                >
                  <span className="text-[42px] leading-none select-none">{meta.icon}</span>
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent pointer-events-none"/>
                </motion.div>

                {/* Label */}
                <span className="text-[13px] font-semibold text-teal text-center leading-tight">
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

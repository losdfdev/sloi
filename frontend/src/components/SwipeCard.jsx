import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

/**
 * SwipeCard - Компонент карточки с поддержкой свайпов влево/вправо (framer-motion)
 * @param {Object} profile - Данные профиля
 * @param {Function} onLike - Callback при свайпе вправо
 * @param {Function} onDislike - Callback при свайпе влево
 */
export default function SwipeCard({ profile, onLike, onDislike }) {
  const [exitX, setExitX] = useState(0);

  const x = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15], {
    clamp: false,
  });
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Haptic feedback (доступно в TG Mini App)
  const haptic = window.Telegram?.WebApp?.HapticFeedback;

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      setExitX(300);
      haptic?.impactOccurred('medium');
      setTimeout(() => onLike?.(), 400);
    } else if (info.offset.x < -100) {
      setExitX(-300);
      haptic?.impactOccurred('light');
      setTimeout(() => onDislike?.(), 400);
    }
  };

  const handleAction = (type) => {
    if (type === 'like') {
      setExitX(300);
      haptic?.impactOccurred('medium');
      setTimeout(() => onLike?.(), 400);
    } else {
      setExitX(-300);
      haptic?.impactOccurred('light');
      setTimeout(() => onDislike?.(), 400);
    }
  };

  if (!profile) return null;

  return (
    <motion.div
      style={{ x, scale, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      className="relative w-full h-full rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing select-none bg-gray-900 border border-white/10 flex flex-col"
    >
      {/* Фото профиля */}
      <div className="relative flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
        {profile.photos && profile.photos.length > 0 ? (
          <>
            {/* Размытый фон для горизонтальных фото */}
            <img
              src={profile.photos[0] || profile.photo_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60 blur-xl scale-110 pointer-events-none"
            />
            {/* Основное фото */}
            <img
              src={profile.photos[0] || profile.photo_url}
              alt={profile.first_name}
              className="relative w-full h-full object-contain pointer-events-none z-10"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 pointer-events-none z-10">
            <span className="text-6xl drop-shadow-lg">👤</span>
          </div>
        )}

        {/* Градиент (Dark + Glassmorphism) */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-black/10 pointer-events-none"></div>

        {/* Инфо профиля */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none z-20">
          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-3xl font-bold drop-shadow-lg flex items-center gap-2">
              {profile.first_name}{!profile.hide_age && `, ${profile.age || '?'}`}
              {profile.is_premium && <span className="text-amber-400 text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" title="Premium">⭐️</span>}
            </h2>
          </div>
          {profile.bio && (
            <p className="text-sm text-white/90 line-clamp-2 drop-shadow-md">
              {profile.bio}
            </p>
          )}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, i) => (
                <span
                  key={i}
                  className="text-xs font-medium bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Счётчик фото (если больше одного) */}
        {profile.photos?.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1 pointer-events-none">
            {profile.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i === 0 ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/30'
                  }`}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Кнопки действия (Эффект стекла) */}
      <div className="flex items-center justify-center gap-8 p-4 bg-white/10 backdrop-blur-xl border-t border-white/10 z-20 shrink-0">
        <button
          onClick={() => handleAction('dislike')}
          className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-red-500 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
          title="Дизлайк"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <button
          onClick={() => handleAction('like')}
          className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-pink-500 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
          title="Лайк"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
        </button>
      </div>
    </motion.div>
  );
}

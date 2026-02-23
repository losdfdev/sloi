import React, { useState, useRef } from 'react';

/**
 * SwipeCard - Компонент карточки с поддержкой свайпов влево/вправо
 * @param {Object} profile - Данные профиля
 * @param {Function} onLike - Callback при свайпе вправо
 * @param {Function} onDislike - Callback при свайпе влево
 * @param {Function} onSkip - Callback при закрытии карточки
 */
export default function SwipeCard({ profile, onLike, onDislike, onSkip }) {
  const [style, setStyle] = useState({});
  const [swiped, setSwiped] = useState(false);
  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  };

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
  };

  const handleMouseUp = (e) => {
    const diffX = e.clientX - startXRef.current;
    const diffY = e.clientY - startYRef.current;
    handleSwipe(diffX, diffY);
  };

  const handleTouchEnd = (e) => {
    const diffX =
      e.changedTouches[0].clientX - startXRef.current;
    const diffY =
      e.changedTouches[0].clientY - startYRef.current;
    handleSwipe(diffX, diffY);
  };

  const handleSwipe = (diffX, diffY) => {
    // Минимальное расстояние для свайпа
    const minSwipeDistance = 50;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (absX > absY && absX > minSwipeDistance) {
      setSwiped(true);
      setStyle({
        transform: `translateX(${diffX > 0 ? 300 : -300}px) rotate(${
          diffX > 0 ? 20 : -20
        }deg)`,
        opacity: 0,
        transition: 'all 0.6s ease-out',
      });

      // Выполняем callback после анимации
      setTimeout(() => {
        if (diffX > 0) {
          onLike?.();
        } else {
          onDislike?.();
        }
      }, 600);
    } else {
      // Вернуть на место
      setStyle({
        transform: 'translateX(0) rotate(0deg)',
        transition: 'all 0.3s ease-out',
      });
    }
  };

  const handleButtonClick = (action) => {
    if (swiped) return;

    setSwiped(true);
    const duration = action === 'like' ? 300 : -300;
    const rotation = action === 'like' ? 20 : -20;

    setStyle({
      transform: `translateX(${duration}px) rotate(${rotation}deg)`,
      opacity: 0,
      transition: 'all 0.6s ease-out',
    });

    setTimeout(() => {
      if (action === 'like') {
        onLike?.();
      } else {
        onDislike?.();
      }
    }, 600);
  };

  if (!profile) return null;

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none"
      style={style}
    >
      {/* Фото профиля */}
      <div className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300">
        {profile.photos && profile.photos.length > 0 ? (
          <img
            src={profile.photos[0] || profile.photo_url}
            alt={profile.first_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-6xl">👤</span>
          </div>
        )}

        {/* Градиент сверху вниз */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"></div>

        {/* Информация профиля */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-2xl font-bold">
              {profile.first_name}, {profile.age || '?'}
            </h2>
          </div>
          {profile.bio && (
            <p className="text-sm opacity-90 line-clamp-2">
              {profile.bio}
            </p>
          )}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, i) => (
                <span
                  key={i}
                  className="text-xs bg-white/20 backdrop-blur px-2 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Счётчик фото (если больше одного) */}
        {profile.photos?.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1">
            {profile.photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i === 0 ? 'bg-white' : 'bg-white/50'
                }`}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Кнопки действия */}
      <div className="flex items-center justify-between p-4 bg-white">
        <button
          onClick={() => handleButtonClick('dislike')}
          disabled={swiped}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-white text-2xl shadow-lg hover:shadow-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Дизлайк"
        >
          ✕
        </button>

        <button
          onClick={() => handleButtonClick('like')}
          disabled={swiped}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-2xl shadow-lg hover:shadow-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Лайк"
        >
          ❤️
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import SwipeCard from '../components/SwipeCard';

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [isPremium] = useState(false); // Будет из user.is_premium

  // Загружаем профили при загрузке
  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/profiles/discover', {
        params: {
          user_id: user?.id,
          limit: 10,
        },
      });

      setProfiles(response.data.profiles || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Ошибка при загрузке профилей');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (profiles.length === 0) return;

    const profile = profiles[0];
    setProfiles(profiles.slice(1));

    // Отправляем лайк на сервер
    try {
      const response = await apiClient.post('/api/interactions/like', {
        user_id: user?.id,
        target_user_id: profile.id,
      });

      setSwipeCount(swipeCount + 1);

      // Если матч — уведомляем пользователя
      if (response.data.isMatch) {
        showMatchNotification(profile);
      }

      // Загружаем больше профилей, если осталось мало
      if (profiles.length <= 3) {
        fetchProfiles();
      }
    } catch (err) {
      console.error('Error liking profile:', err);
    }
  };

  const handleDislike = async () => {
    if (profiles.length === 0) return;

    const profile = profiles[0];
    setProfiles(profiles.slice(1));

    // Отправляем дизлайк на сервер
    try {
      await apiClient.post('/api/interactions/dislike', {
        user_id: user?.id,
        target_user_id: profile.id,
      });

      setSwipeCount(swipeCount + 1);

      // Загружаем больше профилей, если осталось мало
      if (profiles.length <= 3) {
        fetchProfiles();
      }
    } catch (err) {
      console.error('Error disliking profile:', err);
    }
  };

  const showMatchNotification = (matchedProfile) => {
    // TODO: Добавить красивое уведомление о матче
    alert(`🎉 Матч с ${matchedProfile.first_name}!`);
  };

  // Проверяем лимит на бесплатном плане
  const hasSwipesLeft =
    isPremium || swipeCount < 20;

  if (loading && profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-4 text-5xl animate-bounce">💕</div>
          <p className="text-xl font-semibold">Загрузка профилей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 pb-20">
      {/* Шапка */}
      <header className="sticky top-0 z-20 bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tinder</h1>
            <p className="text-xs text-white/80">Профили</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/matches')}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              title="Матчи"
            >
              💬
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              title="Мой профиль"
            >
              👤
            </button>
            <button
              onClick={logout}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition"
              title="Выход"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-sm mx-auto pt-8 px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-500/30 backdrop-blur border border-red-400/50 rounded-xl text-white text-sm">
            {error}
            <button
              onClick={fetchProfiles}
              className="ml-4 underline hover:opacity-80"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Лимит свайпов */}
        {!isPremium && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white">
            <p className="text-sm font-semibold">
              Свайпов сегодня: {swipeCount}/20
            </p>
            {!hasSwipesLeft && (
              <p className="text-xs mt-2 opacity-80">
                Лимит исчерпан. Обновится завтра или купите премиум.
              </p>
            )}
          </div>
        )}

        {/* Стек карточек */}
        {profiles.length > 0 && hasSwipesLeft ? (
          <div className="relative h-screen max-h-96 flex items-center justify-center">
            <SwipeCard
              profile={profiles[0]}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          </div>
        ) : !hasSwipesLeft ? (
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center text-white">
            <div className="text-5xl mb-4">😴</div>
            <h3 className="text-xl font-bold mb-2">Лимит исчерпан</h3>
            <p className="text-sm opacity-90 mb-6">
              Вернитесь завтра или купите премиум подписку для бесконечных свайпов.
            </p>
            <button className="w-full bg-white text-red-500 font-bold py-3 rounded-xl hover:bg-opacity-90 transition">
              Купить премиум
            </button>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center text-white">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">Нет больше профилей!</h3>
            <p className="text-sm opacity-90 mb-6">
              Вы посмотрели все доступные профили. Вернитесь позже.
            </p>
            <button
              onClick={fetchProfiles}
              className="w-full bg-white text-red-500 font-bold py-3 rounded-xl hover:bg-opacity-90 transition"
            >
              Обновить
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import SwipeCard from '../components/SwipeCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [matchData, setMatchData] = useState(null);

  // Загружаем профили при загрузке
  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/profiles/discover', {
        params: {
          user_id: user?.id,
          limit: 10,
        },
      });
      if (response.data.swipeCount !== undefined) {
        setSwipeCount(response.data.swipeCount);
      }
      if (response.data.isPremium !== undefined) {
        setIsPremium(response.data.isPremium);
      }

      setProfiles(prev => {
        if (reset) {
          return response.data.profiles || [];
        }
        // Appending new profiles and filtering out ones we already have
        const existingIds = new Set(prev.map(p => p.id));
        const newProfiles = (response.data.profiles || []).filter(p => !existingIds.has(p.id));
        return [...prev, ...newProfiles];
      });
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

    // Синхронно убираем профиль из UI для моментальной реакции
    setProfiles(prev => prev.slice(1));

    // Отправляем лайк на сервер
    try {
      const response = await apiClient.post('/api/interactions/like', {
        user_id: user?.id,
        target_user_id: profile.id,
      });

      setSwipeCount(prev => prev + 1);

      // Если матч — уведомляем пользователя
      if (response.data.isMatch) {
        showMatchNotification(profile);
      }

      // Загружаем больше профилей, если осталось мало (учитывая, что мы только что удалили один)
      if (profiles.length - 1 <= 3) {
        fetchProfiles();
      }
    } catch (err) {
      console.error('Error liking profile:', err);
    }
  };

  const handleDislike = async () => {
    if (profiles.length === 0) return;

    const profile = profiles[0];

    // Синхронно убираем профиль из UI
    setProfiles(prev => prev.slice(1));

    // Отправляем дизлайк на сервер
    try {
      await apiClient.post('/api/interactions/dislike', {
        user_id: user?.id,
        target_user_id: profile.id,
      });

      setSwipeCount(prev => prev + 1);

      // Загружаем больше профилей, если осталось мало
      if (profiles.length - 1 <= 3) {
        fetchProfiles();
      }
    } catch (err) {
      console.error('Error disliking profile:', err);
    }
  };

  const handleSuperLike = async () => {
    if (profiles.length === 0) return;
    const profile = profiles[0];

    if (!isPremium) {
      alert('Суперлайки доступны только с Premium подпиской!');
      navigate('/profile');
      return;
    }

    setProfiles(prev => prev.slice(1));

    try {
      const response = await apiClient.post('/api/interactions/superlike', {
        user_id: user?.id,
        target_user_id: profile.id,
      });

      // Считаем суперлайк за обычный свайп в лимите, или оставляем так
      setSwipeCount(prev => prev + 1);

      if (response.data?.isMatch) {
        showMatchNotification(profile);
      }

      if (profiles.length - 1 <= 3) fetchProfiles();
    } catch (err) {
      if (err.response?.status === 403) {
        alert(err.response?.data?.error || 'Лимит суперлайков достигнут!');
      }
      console.error('Error superliking profile:', err);
    }
  };

  const handleReport = async (profile) => {
    if (!window.confirm(`Пожаловаться на пользователя ${profile.first_name}? Он больше не будет вам показываться.`)) {
      return;
    }

    setProfiles(prev => prev.slice(1));

    try {
      // Отправляем жалобу, затем дизлайкаем
      await apiClient.post('/api/reports', {
        reporter_id: user?.id,
        reported_id: profile.id,
        reason: 'User Feedback Report'
      });
      await apiClient.post('/api/interactions/dislike', {
        user_id: user?.id,
        target_user_id: profile.id,
      });
      if (profiles.length - 1 <= 3) fetchProfiles();
    } catch (err) {
      console.error('Error reporting profile:', err);
    }
  };

  const showMatchNotification = (matchedProfile) => {
    // Триггер вибрации (Haptic Feedback) Telegram WebApp
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    setMatchData(matchedProfile);
  };

  // Проверяем лимит на бесплатном плане
  const hasSwipesLeft =
    isPremium || swipeCount < 20;

  if (loading && profiles.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-center text-white/50 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mb-6 animate-pulse"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          <p className="text-xl font-medium tracking-wide">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 font-sans tracking-tight transition-colors duration-500 ease-in-out ${isPremium ? 'bg-gradient-to-br from-[#1a1100] via-[#0A0A0B] to-[#120a00]' : 'bg-[#0A0A0B]'}`}>
      {/* Шапка */}
      <header className={`sticky top-0 z-20 backdrop-blur-xl border-b p-4 ${isPremium ? 'bg-[#1a1100]/80 border-amber-500/20 shadow-[0_4px_30px_rgba(245,158,11,0.05)]' : 'bg-[#0A0A0B]/80 border-white/5'}`}>
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Sloi<span className={isPremium ? "text-amber-500" : "text-indigo-400"}>.</span>
            </h1>
            <p className={`text-xs font-medium tracking-widest uppercase flex items-center gap-1 ${isPremium ? 'text-amber-200/60' : 'text-indigo-200/50'}`}>
              Discover {isPremium && <span className="text-amber-400 text-[10px] animate-pulse">⭐️ VIP</span>}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/likes')}
              className="w-10 h-10 rounded-full bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center text-amber-500 transition-colors border border-amber-500/20"
              title="Кому я нравлюсь"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
            </button>
            <button
              onClick={() => navigate('/matches')}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 transition-colors border border-white/5"
              title="Матчи"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${isPremium ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/20'}`}
              title="Мой профиль"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
            </button>
            <button
              onClick={logout}
              className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors border border-red-500/20 ml-2"
              title="Выход"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.5 2.25a.75.75 0 01.75.75v1A1.5 1.5 0 0018.75 5.5h.5a.75.75 0 01.75.75v11.5a.75.75 0 01-.75.75h-.5a1.5 1.5 0 00-1.5 1.5v1a.75.75 0 01-1.5 0v-1a3 3 0 013-3h.5V7h-.5a3 3 0 01-3-3v-1a.75.75 0 01.75-.75z" clipRule="evenodd" /><path fillRule="evenodd" d="M9 5.053a.75.75 0 010 1.394l-4.5 2.25v6.606l4.5 2.25a.75.75 0 01-.67 1.341l-5.25-2.625a.75.75 0 01-.43-.67V8.404a.75.75 0 01.43-.67l5.25-2.625zM12.53 8.22a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H5.25a.75.75 0 010-1.5h9.01l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-sm mx-auto pt-4 px-4 flex flex-col h-[calc(100vh-80px)]">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            {error}
            <button
              onClick={fetchProfiles}
              className="ml-4 font-bold hover:text-red-300 transition"
            >
              Повторить
            </button>
          </div>
        )}

        {/* Лимит свайпов */}
        {!isPremium && (
          <div className="mb-6 p-4 bg-[#141415] border border-white/5 rounded-2xl text-white">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white/70">Свайпы сегодня:</span>
              <span className="text-sm font-bold">{swipeCount} / 20</span>
            </div>
            {!hasSwipesLeft && (
              <p className="text-xs mt-3 text-red-400/80 font-medium">
                Лимит исчерпан. Обновится завтра.
              </p>
            )}
          </div>
        )}

        {/* Стек карточек */}
        {profiles.length > 0 && hasSwipesLeft ? (
          <div className="relative flex-1 h-[75vh] max-h-[580px] w-full max-w-[340px] mx-auto flex items-center justify-center">
            <SwipeCard
              key={profiles[0].id}
              profile={profiles[0]}
              onLike={handleLike}
              onDislike={handleDislike}
              onSuperLike={handleSuperLike}
              onReport={handleReport}
            />
          </div>
        ) : !hasSwipesLeft ? (
          <div className="bg-[#141415] border border-white/5 rounded-3xl p-10 text-center text-white">
            <div className="text-5xl mb-6 opacity-80">🔒</div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Лимит исчерпан</h3>
            <p className="text-sm text-white/50 mb-8 leading-relaxed">
              Вернитесь завтра или оформите <span className="text-white">Premium</span> для бесконечных свайпов.
            </p>
            <button className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition">
              Купить Premium
            </button>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-[#141415] border border-indigo-500/10 rounded-3xl p-10 text-center text-white relative flex flex-col items-center z-10">
            <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="text-5xl mb-6 opacity-90 relative">✨</div>
            <h3 className="text-xl font-bold mb-3 tracking-tight relative">Это все на сегодня!</h3>
            <p className="text-sm text-white/50 mb-8 leading-relaxed relative z-10">
              Вы посмотрели все доступные профили. Заходите позже.
            </p>
            <button
              onClick={() => fetchProfiles(true)}
              className="w-full bg-white/10 text-white font-bold py-3.5 rounded-2xl hover:bg-white/20 transition relative z-20"
            >
              Обновить
            </button>
          </div>
        ) : null}
      </main>

      {/* Match Screen Overlay */}
      <AnimatePresence>
        {matchData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            {/* Анимация конфетти/свечения на фоне */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-600/40 via-transparent to-transparent opacity-70 animate-pulse pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center p-6 text-center w-full max-w-sm">
              <motion.h2
                initial={{ scale: 0.5, y: -50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotate: [-2, 2, -2, 0] }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] mb-10"
              >
                It's a Match!
              </motion.h2>

              <div className="flex justify-center items-center mb-10 relative">
                {/* Аватар пользователя */}
                <motion.div
                  initial={{ x: -100, opacity: 0, rotate: -20 }}
                  animate={{ x: 20, opacity: 1, rotate: -5 }}
                  transition={{ delay: 0.3, type: 'spring', damping: 12 }}
                  className="w-28 h-28 rounded-full border-4 border-pink-500 overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.6)] z-10"
                >
                  <img src={user?.photos?.[0] || user?.photo_url || ''} alt="You" className="w-full h-full object-cover" />
                </motion.div>

                {/* Аватар пары */}
                <motion.div
                  initial={{ x: 100, opacity: 0, rotate: 20 }}
                  animate={{ x: -20, opacity: 1, rotate: 5 }}
                  transition={{ delay: 0.3, type: 'spring', damping: 12 }}
                  className="w-28 h-28 rounded-full border-4 border-yellow-400 overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.6)]"
                >
                  <img src={matchData.photos?.[0] || matchData.photo_url || ''} alt={matchData.first_name} className="w-full h-full object-cover" />
                </motion.div>

                {/* Сердечко посередине */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="absolute z-20 text-4xl drop-shadow-xl saturate-150"
                  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  💖
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-white text-lg font-medium mb-12"
              >
                Вы и {matchData.first_name} понравились друг другу!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="w-full space-y-4"
              >
                <button
                  onClick={() => navigate('/matches')}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-4 rounded-full text-lg shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform"
                >
                  Написать сообщение
                </button>
                <button
                  onClick={() => setMatchData(null)}
                  className="w-full bg-white/10 backdrop-blur-md text-white font-semibold py-4 rounded-full text-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Продолжить свайпать
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence >
    </div >
  );
}

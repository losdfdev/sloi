import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

export default function MatchesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/matches/${user?.id}`);
      setMatches(response.data.matches || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Ошибка при загрузке матчей');
    } finally {
      setLoading(false);
    }
  };

  // Получить партнёра матча
  const getPartner = (match) => {
    if (match.user1_id === user?.id) {
      return match.user2;
    }
    return match.user1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="text-center text-white/50 flex flex-col items-center">
          <div className="mb-6 text-5xl opacity-80">💬</div>
          <p className="text-xl font-medium tracking-wide">Загрузка матчей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] pb-20 font-sans tracking-tight">
      {/* Шапка */}
      <header className="sticky top-0 z-20 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Матчи.</h1>
            <p className="text-xs text-white/40 font-medium tracking-widest uppercase">{matches.length} связей</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 transition-colors border border-white/5"
              title="Назад к свайпам"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/80 transition-colors border border-white/5"
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
      <main className="max-w-sm mx-auto pt-6 px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            {error}
            <button
              onClick={fetchMatches}
              className="ml-4 font-bold hover:text-red-300 transition"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-[#141415] border border-white/5 rounded-3xl p-10 text-center text-white">
            <div className="text-5xl mb-6 opacity-80">🤍</div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Пока пусто</h3>
            <p className="text-sm text-white/50 mb-8 leading-relaxed">
              Напишите первым или продолжайте свайпать, чтобы найти совпадения.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition"
            >
              Свайпать
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const partner = getPartner(match);
              return (
                <button
                  key={match.id}
                  onClick={() => {
                    const haptic = window.Telegram?.WebApp?.HapticFeedback;
                    haptic?.impactOccurred('light');

                    if (partner?.username) {
                      const url = `https://t.me/${partner.username}`;
                      if (window.Telegram?.WebApp?.openTelegramLink) {
                        window.Telegram.WebApp.openTelegramLink(url);
                      } else {
                        window.open(url, '_blank');
                      }
                    } else {
                      if (window.Telegram?.WebApp?.showAlert) {
                        window.Telegram.WebApp.showAlert('К сожалению, у пользователя скрыт username 😔');
                      } else {
                        alert('К сожалению, у пользователя скрыт username 😔');
                      }
                    }
                  }}
                  className="w-full bg-[#141415] border border-white/5 hover:bg-white/5 hover:border-white/10 rounded-3xl p-4 text-left transition-all flex items-center gap-4 group"
                >
                  {/* Фото */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    {partner?.photos?.[0] || partner?.photo_url ? (
                      <img
                        src={partner.photos?.[0] || partner.photo_url}
                        alt={partner?.first_name}
                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {partner?.first_name} {partner?.last_name || ''}
                    </h3>
                    <p className="text-sm font-medium text-blue-400 mt-0.5 truncate group-hover:underline">
                      {partner?.username ? `@${partner.username}` : 'Скрытый ник'}
                    </p>
                    <p className="text-xs text-white/40 truncate mt-1">
                      Матч: {new Date(match.matched_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>

                  {/* Иконка чата (Telegram) */}
                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center text-white/30 group-hover:text-blue-400 transition-all shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                      <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

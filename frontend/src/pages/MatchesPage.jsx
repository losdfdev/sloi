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
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-4 text-5xl">💬</div>
          <p className="text-xl font-semibold">Загрузка матчей...</p>
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
            <h1 className="text-2xl font-bold text-white">Матчи</h1>
            <p className="text-xs text-white/80">{matches.length} матчей</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              title="Назад к свайпам"
            >
              ❤️
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
              onClick={fetchMatches}
              className="ml-4 underline hover:opacity-80"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center text-white">
            <div className="text-5xl mb-4">💭</div>
            <h3 className="text-xl font-bold mb-2">Нет матчей</h3>
            <p className="text-sm opacity-90 mb-6">
              Начните свайпить, чтобы найти матчи!
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white text-red-500 font-bold py-3 rounded-xl hover:bg-opacity-90 transition"
            >
              Назад к свайпам
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const partner = getPartner(match);
              return (
                <button
                  key={match.id}
                  onClick={() => navigate(`/chat/${match.id}`)}
                  className="w-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 rounded-xl p-4 text-left transition"
                >
                  <div className="flex items-center gap-4">
                    {/* Фото */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300">
                      {partner?.photos?.[0] || partner?.photo_url ? (
                        <img
                          src={partner.photos?.[0] || partner.photo_url}
                          alt={partner?.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          👤
                        </div>
                      )}
                    </div>

                    {/* Информация */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {partner?.first_name}
                      </h3>
                      <p className="text-sm text-white/70 truncate">
                        Матч: {new Date(match.matched_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>

                    {/* Стрелка */}
                    <div className="text-white/50">→</div>
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

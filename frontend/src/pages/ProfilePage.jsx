import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    age: user?.age || '',
    bio: user?.bio || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // TODO: API запрос для обновления профиля
      updateUser({ ...user, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 pb-20">
      {/* Шапка */}
      <header className="sticky top-0 z-20 bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Профиль</h1>
            <p className="text-xs text-white/80">Мой аккаунт</p>
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
              onClick={() => navigate('/matches')}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
              title="Матчи"
            >
              💬
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
        {/* Фото профиля */}
        <div className="mb-8">
          <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden mb-4">
            {user?.photos?.[0] || user?.photo_url ? (
              <img
                src={user.photos?.[0] || user.photo_url}
                alt={user?.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">
                👤
              </div>
            )}
          </div>
          <button className="w-full bg-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/30 transition">
            Изменить фото
          </button>
        </div>

        {/* Данные профиля */}
        {editing ? (
          // Режим редактирования
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full bg-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Фамилия
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full bg-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Возраст
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-white/50"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  О себе
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full bg-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 border border-white/20 focus:outline-none focus:border-white/50 min-h-24"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-white text-red-500 font-bold py-3 rounded-xl hover:bg-opacity-90 transition"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/30 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          // Режим просмотра
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 mb-6">
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-white/70 text-sm">Имя</p>
                <p className="text-white text-lg font-semibold">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>

              {user?.age && (
                <div>
                  <p className="text-white/70 text-sm">Возраст</p>
                  <p className="text-white text-lg font-semibold">{user.age} лет</p>
                </div>
              )}

              {user?.bio && (
                <div>
                  <p className="text-white/70 text-sm">О себе</p>
                  <p className="text-white text-lg">{user.bio}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/30 transition"
            >
              Редактировать
            </button>
          </div>
        )}

        {/* Статистика */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold text-lg mb-4">Статистика</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Профиль создан</span>
              <span className="text-white font-semibold">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('ru-RU')
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Последний вход</span>
              <span className="text-white font-semibold">
                {user?.last_login
                  ? new Date(user.last_login).toLocaleDateString('ru-RU')
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Telegram ID</span>
              <span className="text-white font-semibold text-sm">{user?.telegram_id}</span>
            </div>
          </div>
        </div>

        {/* Опции */}
        <div className="space-y-3">
          <button className="w-full bg-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/30 transition">
            🛡️ Блокировки и жалобы
          </button>
          <button className="w-full bg-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/30 transition">
            ⚙️ Уведомления
          </button>
          <button
            onClick={logout}
            className="w-full bg-red-500/30 text-white font-semibold py-3 rounded-xl hover:bg-red-500/40 transition"
          >
            🚪 Выход
          </button>
        </div>
      </main>
    </div>
  );
}

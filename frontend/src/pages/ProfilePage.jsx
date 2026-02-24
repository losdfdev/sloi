import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [buyingStar, setBuyingStar] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    age: user?.age || '',
    bio: user?.bio || '',
    gender: user?.gender || 'not_specified',
    search_gender: user?.search_gender || 'all',
    min_age: user?.min_age || 18,
    max_age: user?.max_age || 100,
  });

  const handleToggleNotifications = async (e) => {
    const newStatus = e.target.checked;
    try {
      const res = await apiClient.put(`/api/profiles/${user.id}`, { notifications_enabled: newStatus });
      updateUser({ ...user, notifications_enabled: newStatus });
    } catch (error) {
      console.error('Error saving notification setting:', error);
      e.target.checked = !newStatus; // revert visual state on error
      alert('Ошибка при сохранении настроек уведомлений');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append('photo', file);

      const res = await apiClient.post(`/api/profiles/${user.id}/photo`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser({ ...user, photos: res.data.photos, photo_url: res.data.photo_url });
    } catch (err) {
      console.error('Upload Error', err);
      alert('Ошибка при загрузке фото');
    } finally {
      setUploading(false);
    }
  };

  const handleBuyPremium = async () => {
    try {
      setBuyingStar(true);
      const res = await apiClient.post('/api/stars/invoice', { user_id: user?.id, type: 'premium' });
      const invoiceLink = res.data.invoice_link;
      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(invoiceLink, async (status) => {
          if (status === 'paid') {
            alert('Оплата успешно завершена!');
            try {
              const premiumRes = await apiClient.post(`/api/profiles/${user.id}/grant-premium`);
              updateUser(premiumRes.data);
            } catch (err) {
              console.error('Failed to grant premium on frontend', err);
            }
          }
        });
      } else {
        alert('Покупка доступна только внутри Telegram Mini App! Link: ' + invoiceLink);
      }
    } catch (err) {
      console.error('Invoice Error', err);
      alert('Ошибка формирования счета');
    } finally {
      setBuyingStar(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null,
        min_age: formData.min_age ? parseInt(formData.min_age, 10) : 18,
        max_age: formData.max_age ? parseInt(formData.max_age, 10) : 100,
      };

      // API запрос для обновления профиля
      const res = await apiClient.put(`/api/profiles/${user.id}`, payload);
      updateUser(res.data);
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Ошибка при сохранении: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] pb-20 font-sans tracking-tight">
      {/* Шапка */}
      <header className="sticky top-0 z-20 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Профиль<span className="text-indigo-400">.</span></h1>
            <p className="text-xs text-indigo-200/50 font-medium tracking-widest uppercase">Мой аккаунт</p>
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
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center justify-center text-indigo-300 transition-colors border border-indigo-500/20"
              title="Назад к свайпам"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </button>
            <button
              onClick={() => navigate('/matches')}
              className="w-10 h-10 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 flex items-center justify-center text-indigo-300 transition-colors border border-indigo-500/20"
              title="Матчи"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-sm mx-auto pt-8 px-4">
        <div className="mb-8 relative flex items-center justify-center">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#141415] rounded-full overflow-hidden shadow-2xl relative group border border-white/10">
            {user?.photos?.[0] || user?.photo_url ? (
              <img
                src={user.photos?.[0] || user.photo_url}
                alt={user?.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl opacity-50">
                👤
              </div>
            )}
            {/* Оверлей при загрузке */}
            {uploading && (
              <div className="absolute inset-0 bg-[#0A0A0B]/80 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <label className="w-full bg-[#141415] text-white font-semibold py-3.5 rounded-2xl hover:bg-white/5 transition flex items-center justify-center border border-white/5 cursor-pointer">
            {uploading ? 'Загрузка...' : '📸 Изменить фото'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Данные профиля */}
        {editing ? (
          // Режим редактирования
          <div className="space-y-6 mb-8">
            <div className="bg-[#141415] border border-white/5 rounded-3xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 opacity-90">Личная информация</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Имя
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0B] text-white placeholder-white/20 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0B] text-white placeholder-white/20 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Возраст
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0B] text-white placeholder-white/20 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                    О себе
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0B] text-white placeholder-white/20 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-white/20 transition-colors min-h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Мой Пол
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0B] text-white rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-white/20 transition-colors appearance-none"
                  >
                    <option value="not_specified">Не указан</option>
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#141415] border border-white/5 rounded-3xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 opacity-90">Настройки поиска</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Кого я ищу
                  </label>
                  <select
                    name="search_gender"
                    value={formData.search_gender}
                    onChange={handleChange}
                    className="w-full bg-[#0A0A0B] text-white rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-white/20 transition-colors appearance-none"
                  >
                    <option value="all">Всех</option>
                    <option value="male">Мужчин</option>
                    <option value="female">Женщин</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                      ОТ (ЛЕТ)
                    </label>
                    <input
                      type="number"
                      name="min_age"
                      value={formData.min_age}
                      onChange={handleChange}
                      className="w-full bg-[#0A0A0B] text-white placeholder-white/20 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                      ДО (ЛЕТ)
                    </label>
                    <input
                      type="number"
                      name="max_age"
                      value={formData.max_age}
                      onChange={handleChange}
                      className="w-full bg-[#0A0A0B] text-white placeholder-white/20 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-indigo-500 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-600 transition shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-white/5 text-white font-bold py-3.5 rounded-2xl hover:bg-white/10 transition border border-white/5"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          // Режим просмотра
          <div className="bg-[#141415] border border-white/5 rounded-3xl p-6 mb-6 relative overflow-hidden">

            <div className="space-y-5 mb-6 relative z-10">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Имя</p>
                <div className="text-white text-xl font-bold tracking-tight flex items-center gap-2">
                  <span>{user?.first_name} {user?.last_name} <span className="text-white/50 font-normal ml-1">{user?.age && `${user.age}`}</span></span>
                  {user?.is_premium && <span className="text-amber-400 text-lg drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" title="Premium Пользователь">⭐️</span>}
                </div>
              </div>

              {user?.bio && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">О себе</p>
                  <p className="text-white/80 text-sm leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-indigo-500/5 text-indigo-300 font-semibold py-3.5 flex items-center justify-center gap-2 rounded-xl hover:bg-indigo-500/10 transition border border-indigo-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
              Редактировать профиль
            </button>
          </div>
        )}

        {/* Premium / Telegram Stars */}
        <div className="bg-gradient-to-br from-indigo-900 to-black rounded-3xl p-6 mb-8 relative overflow-hidden border border-indigo-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="relative z-10 text-center">
            <h3 className="text-white font-black text-xl mb-2 flex items-center justify-center gap-2 tracking-tight">
              <span>💎</span> SLOI PREMIUM
            </h3>

            {user?.is_premium ? (
              <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-amber-400 font-bold mb-1 flex items-center justify-center gap-2">
                  <span>⭐️</span> Premium Активен
                </p>
                {user?.premium_expires_at && (
                  <p className="text-white/60 text-sm">
                    {new Date(user.premium_expires_at).getFullYear() > 2090 ? (
                      <span className="text-lg">Осталось: <b className="text-white text-2xl ml-1 leading-none inline-block align-middle">∞</b></span>
                    ) : (
                      <span>
                        Осталось дней: <b className="text-white">{Math.max(0, Math.ceil((new Date(user.premium_expires_at) - new Date()) / (1000 * 60 * 60 * 24)))}</b>
                      </span>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="text-white/70 text-sm mb-5 leading-relaxed">
                  Безлимитные свайпы и расширенные фильтры. Найди тех, кто ищет именно тебя.
                </p>
                <button
                  onClick={handleBuyPremium}
                  disabled={buyingStar}
                  className="w-full bg-indigo-500 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.4)]"
                >
                  {buyingStar ? (
                    <span className="animate-pulse">Оплата...</span>
                  ) : (
                    <>Подписка на 7 дней - 100 ⭐️</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-[#141415] border border-white/5 rounded-3xl p-6 mb-6">
          <h3 className="text-white font-bold text-lg mb-4 opacity-90">Информация</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/50 text-sm">Профиль создан</span>
              <span className="text-white tracking-tight text-sm">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('ru-RU')
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/50 text-sm">Последний вход</span>
              <span className="text-white tracking-tight text-sm">
                {user?.last_login
                  ? new Date(user.last_login).toLocaleDateString('ru-RU')
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Telegram ID</span>
              <span className="text-white/30 font-mono text-xs">{user?.telegram_id}</span>
            </div>
          </div>
        </div>

        {/* Опции */}
        <div className="space-y-3">
          {user?.is_admin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-red-500/10 text-red-500 font-semibold py-3.5 rounded-2xl hover:bg-red-500/20 transition flex items-center justify-center gap-2 border border-red-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span>Панель Администратора</span>
            </button>
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full bg-indigo-500/5 text-indigo-200 font-semibold py-3.5 rounded-2xl hover:bg-indigo-500/10 transition flex items-center justify-center gap-2 border border-indigo-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
            <span>Настройки</span>
          </button>
          <button
            onClick={logout}
            className="w-full bg-red-500/10 text-red-500 font-semibold py-3.5 rounded-2xl hover:bg-red-500/20 transition border border-red-500/20"
          >
            Выйти из аккаунта
          </button>
        </div>
      </main>

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm bg-gray-900 border-t border-white/20 rounded-t-3xl p-6 pb-12 shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[80vh] overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              {activeSettingsTab ? (
                <button
                  onClick={() => setActiveSettingsTab(null)}
                  className="text-white hover:text-pink-400 transition flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  <span>Назад</span>
                </button>
              ) : (
                <h2 className="text-xl font-bold text-white">Настройки</h2>
              )}

              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setActiveSettingsTab(null);
                }}
                className="text-white/50 hover:text-white transition ml-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content Lists */}
            {!activeSettingsTab && (
              <div className="space-y-4">
                <div onClick={() => setActiveSettingsTab('privacy')} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 hover:bg-white/10 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔒</span>
                    <span className="text-white font-medium">Конфиденциальность</span>
                  </div>
                  <span className="text-white/30">›</span>
                </div>
                <div onClick={() => setActiveSettingsTab('blocked')} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 hover:bg-white/10 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🛡️</span>
                    <span className="text-white font-medium">Заблокированные пользователи</span>
                  </div>
                  <span className="text-white/30">›</span>
                </div>
                <div onClick={() => setActiveSettingsTab('notifications')} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 hover:bg-white/10 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔔</span>
                    <span className="text-white font-medium">Уведомления</span>
                  </div>
                  <span className="text-white/30">›</span>
                </div>
              </div>
            )}

            {/* Sub-Tabs Content */}
            {activeSettingsTab === 'privacy' && (
              <div className="space-y-4 animate-[slideUp_0.2s_ease-out]">
                <h3 className="text-lg font-bold text-white mb-2">Конфиденциальность</h3>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/90">Показывать мой профиль в поиске</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-pink"
                    checked={user?.show_in_search !== false}
                    onChange={async (e) => {
                      const val = e.target.checked;
                      try {
                        await apiClient.put(`/api/profiles/${user.id}`, { show_in_search: val });
                        updateUser({ ...user, show_in_search: val });
                      } catch (err) {
                        e.target.checked = !val;
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/90">Скрыть мой онлайн статус</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-pink"
                    checked={user?.hide_online_status === true}
                    onChange={async (e) => {
                      const val = e.target.checked;
                      try {
                        await apiClient.put(`/api/profiles/${user.id}`, { hide_online_status: val });
                        updateUser({ ...user, hide_online_status: val });
                      } catch (err) {
                        e.target.checked = !val;
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/90">Скрывать возраст</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-pink"
                    checked={user?.hide_age === true}
                    onChange={async (e) => {
                      const val = e.target.checked;
                      try {
                        await apiClient.put(`/api/profiles/${user.id}`, { hide_age: val });
                        updateUser({ ...user, hide_age: val });
                      } catch (err) {
                        e.target.checked = !val;
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeSettingsTab === 'blocked' && (
              <div className="space-y-4 animate-[slideUp_0.2s_ease-out]">
                <h3 className="text-lg font-bold text-white mb-2">Заблокированные</h3>
                <div className="text-center py-6 text-white/50 text-sm">
                  У вас нет заблокированных пользователей.
                </div>
              </div>
            )}

            {activeSettingsTab === 'notifications' && (
              <div className="space-y-4 animate-[slideUp_0.2s_ease-out]">
                <h3 className="text-lg font-bold text-white mb-2">Уведомления</h3>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/90">Уведомления о новых матчах и лайках</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-pink"
                    checked={user?.notifications_enabled !== false}
                    onChange={handleToggleNotifications}
                  />
                </div>
                {/* Removed Новые сообщения as they are not currently supported by bot */}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

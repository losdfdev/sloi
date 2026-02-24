import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const { isAuthenticated, initAuth, loading, error, user } = useAuthStore();
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    // Инициируем авторизацию при загрузке страницы
    initAuth().then(() => setAuthAttempted(true));
  }, []);

  useEffect(() => {
    // Перенаправляем если авторизованы
    if (isAuthenticated && user) {
      // Небольшая задержка для плавного перехода
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 font-sans tracking-tight">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-sm w-full">
        {/* Лого и заголовок */}
        <div className="text-center mb-16 mt-8">
          <div className="mb-8 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">Sloi.</h1>
          <p className="text-sm text-white/40 font-medium tracking-widest uppercase">Find your match</p>
        </div>

        {/* Основной контент */}
        <div className="bg-[#141415] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {loading && !authAttempted ? (
            // Состояние загрузки
            <div className="text-center py-8">
              <div className="inline-block mb-8 relative">
                <div className="w-16 h-16 border-2 border-white/10 rounded-full absolute inset-0"></div>
                <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-white text-lg font-bold tracking-tight mb-2">
                Инициализация
              </p>
              <p className="text-white/40 text-sm">
                Проверка Telegram...
              </p>
            </div>
          ) : error && authAttempted ? (
            // Состояние ошибки
            <div className="text-center py-6">
              <div className="mb-6 flex justify-center text-red-500/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <p className="text-white text-xl font-bold tracking-tight mb-3">
                Ошибка доступа
              </p>
              <p className="text-white/50 text-sm mb-8 px-4 leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Повторить попытку
              </button>
              <p className="text-white/30 text-xs mt-6">
                Приложение работает только в Telegram
              </p>
            </div>
          ) : isAuthenticated && user ? (
            // Состояние успеха
            <div className="text-center py-8">
              <div className="mb-8 flex justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <p className="text-white text-2xl font-bold tracking-tight mb-2">
                С возвращением,
              </p>
              <p className="text-white/80 text-xl font-medium mb-8">
                {user.first_name}
              </p>

              <div className="flex justify-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse delay-150"></div>
                <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse delay-300"></div>
              </div>
              <p className="text-white/30 text-xs uppercase tracking-widest mt-4">
                Загрузка профиля
              </p>
            </div>
          ) : (
            // Состояние "не удалось авторизоваться"
            <div className="text-center py-6">
              <div className="mb-6 flex justify-center text-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </div>
              <p className="text-white text-xl font-bold tracking-tight mb-4">
                Требуется Telegram
              </p>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">
                Это приложение работает исключительно внутри мессенджера Telegram. Запустите бота для продолжения.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Обновить
              </button>
            </div>
          )}
        </div>

        {/* Нижний текст */}
        <p className="text-center text-white/30 text-xs mt-8 tracking-wide">
          Продолжая, вы принимаете нашу{' '}
          <span className="text-white/50 cursor-pointer hover:text-white transition-colors">Политику конфиденциальности</span>
        </p>
      </div>
    </div>
  );
}

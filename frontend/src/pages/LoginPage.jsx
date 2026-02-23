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
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 flex items-center justify-center p-4">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-sm w-full">
        {/* Лого и заголовок */}
        <div className="text-center mb-12">
          <div className="mb-6 text-7xl animate-bounce">💕</div>
          <h1 className="text-5xl font-bold text-white mb-2">Tinder</h1>
          <p className="text-lg text-white opacity-90">Найди свою вторую половинку</p>
        </div>

        {/* Основной контент */}
        <div className="bg-white bg-opacity-15 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          {loading && !authAttempted ? (
            // Состояние загрузки
            <div className="text-center py-8">
              <div className="inline-block mb-6">
                <div className="animate-spin">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>
              <p className="text-white text-lg font-semibold mb-2">
                Инициализация приложения...
              </p>
              <p className="text-white text-sm opacity-80">
                Подождите, мы проверяем вашу личность через Telegram
              </p>
            </div>
          ) : error && authAttempted ? (
            // Состояние ошибки
            <div className="text-center py-8">
              <div className="mb-6 text-5xl">⚠️</div>
              <p className="text-white text-lg font-semibold mb-3">
                Ошибка авторизации
              </p>
              <p className="text-white text-sm opacity-90 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white text-red-500 font-bold py-3 rounded-xl hover:bg-opacity-90 transition"
              >
                Попробовать снова
              </button>
              <p className="text-white text-xs opacity-70 mt-4">
                Убедитесь, что открыли это приложение в Telegram
              </p>
            </div>
          ) : isAuthenticated && user ? (
            // Состояние успеха
            <div className="text-center py-8">
              <div className="mb-6 text-5xl animate-bounce">✨</div>
              <p className="text-white text-lg font-semibold">
                Добро пожаловать, {user.first_name}!
              </p>
              <p className="text-white text-sm opacity-80 mt-2">
                Перенаправление...
              </p>
              <div className="mt-6 flex justify-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          ) : (
            // Состояние "не удалось авторизоваться"
            <div className="text-center py-8">
              <div className="mb-6 text-5xl">📱</div>
              <p className="text-white text-lg font-semibold mb-3">
                Авторизация через Telegram
              </p>
              <p className="text-white text-sm opacity-90 mb-6">
                Это приложение работает только внутри Telegram. Откройте Telegram и запустите бота.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white text-red-500 font-bold py-3 rounded-xl hover:bg-opacity-90 transition"
              >
                Повторить попытку
              </button>
            </div>
          )}
        </div>

        {/* Нижний текст */}
        <p className="text-center text-white text-xs opacity-70 mt-8">
          Продолжая, вы принимаете нашу{' '}
          <span className="underline cursor-pointer">Политику конфиденциальности</span>
        </p>
      </div>
    </div>
  );
}

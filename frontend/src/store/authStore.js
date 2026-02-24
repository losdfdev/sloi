import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Создаём axios инстанс с дефолтными настройками
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Helper function to extract fallback logic
const fallbackAuth = (set) => {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (savedToken && savedUser) {
    set({
      user: JSON.parse(savedUser),
      isAuthenticated: true,
      token: savedToken,
      loading: false,
      error: null,
    });
    return true;
  } else {
    set({
      loading: false,
      error: 'Зайдите в приложение через Telegram или настройте Local Storage',
    });
    return false;
  }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  loading: true,
  error: null,

  initAuth: async () => {
    try {
      set({ loading: true, error: null });

      // Проверяем, доступна ли Telegram WebApp API
      if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();

        // Получаем данные пользователя от Telegram
        const initData = webApp.initData;

        if (initData) {
          // Парсим данные
          const params = new URLSearchParams(initData);
          const user = JSON.parse(params.get('user') || '{}');
          const authDate = params.get('auth_date');
          const hash = params.get('hash');

          if (!user.id || !authDate || !hash) {
            console.warn('Неполные данные авторизации от Telegram. Использую локальный кэш.');
            return fallbackAuth(set);
          }

          // Отправляем на сервер для проверки подписи
          const response = await api.post('/api/auth/telegram', {
            initData: initData,
          });

          if (response.data.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              token: response.data.token,
              loading: false,
              error: null,
            });

            // Сохраняем в localStorage для fallback
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            return true;
          } else {
            console.warn('Ошибка авторизации на сервере. Использую локальный кэш.');
            return fallbackAuth(set);
          }
        } else {
          // Если пустой initData (браузер / локальная разработка)
          console.warn('initData не найден. Использую локальный кэш.');
          return fallbackAuth(set);
        }
      } else {
        // Fallback для локального тестирования (без Telegram)
        return fallbackAuth(set);
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Пытаемся запустить fallback при сетевой ошибке
      const fallbackSuccess = fallbackAuth(set);
      if (!fallbackSuccess) {
        set({
          error: error.response?.data?.error || error.message,
          loading: false,
          isAuthenticated: false,
        });
      }
      return fallbackSuccess;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      isAuthenticated: false,
      token: null,
      error: null,
    });
  },

  updateUser: (userData) => {
    set({ user: userData });
    localStorage.setItem('user', JSON.stringify(userData));
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

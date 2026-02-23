# 🚀 Быстрый старт — Tinder TG Mini App

## Предварительные требования

- **Node.js** 16+ и npm
- **Git**
- **Telegram Desktop** или мобильный Telegram для тестирования

---

## ⚡ Шаг 1: Подготовка Telegram Bot

1. Откройте Telegram и найдите **@BotFather**
2. Отправьте `/newbot`
3. Следуйте инструкциям (дайте имя и юзернейм боту)
4. Скопируйте **Bot Token** (выглядит как: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

---

## ⚡ Шаг 2: Создать Supabase проект

1. Перейдите на https://supabase.com
2. Создайте новый проект (выберите регион ближе к вам)
3. Получите:
   - **Project URL** (выглядит как: `https://your-project.supabase.co`)
   - **Anon Key** (в Settings → API)

4. Откройте **SQL Editor** и выполните запрос из `docs/DATABASE_SCHEMA.sql`

---

## ⚡ Шаг 3: Настроить окружение

### Backend (.env)

```bash
cd ~/Desktop/tinder-tg-miniapp/backend
cp ../.env.example .env
```

Отредактируйте `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_из_BotFather
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=ваш_anon_key_из_Supabase
NODE_ENV=development
PORT=5000
```

### Frontend (.env)

```bash
cd ~/Desktop/tinder-tg-miniapp/frontend
cp ../.env.example .env
```

Отредактируйте `frontend/.env`:

```env
REACT_APP_TELEGRAM_BOT_ID=ваш_bot_id_из_BotFather
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=ваш_anon_key
REACT_APP_API_URL=http://localhost:5000
```

---

## ⚡ Шаг 4: Установить зависимости

### Backend

```bash
cd ~/Desktop/tinder-tg-miniapp/backend
npm install
```

### Frontend

```bash
cd ~/Desktop/tinder-tg-miniapp/frontend
npm install
```

---

## ⚡ Шаг 5: Запустить локально

### Terminal 1 — Backend

```bash
cd ~/Desktop/tinder-tg-miniapp/backend
npm run dev
```

Вывод:
```
🚀 Server running on http://localhost:5000
```

### Terminal 2 — Frontend

```bash
cd ~/Desktop/tinder-tg-miniapp/frontend
npm run dev
```

Вывод:
```
  VITE v4.4.9  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## ⚡ Шаг 6: Настроить Mini App в боте

1. Откройте **@BotFather** снова
2. Отправьте `/mycommands`
3. Выберите вашего бота
4. Добавьте команду:
   ```
   start - Начать приложение
   ```

5. Отправьте `/setwebapp` → выберите бота → `start` → ввести URL:
   ```
   http://localhost:5173/
   ```
   (или для production: `https://your-domain.vercel.app`)

---

## ⚡ Шаг 7: Тестировать

1. Откройте **Telegram Desktop**
2. Найдите вашего бота
3. Нажмите кнопку "/start" или команду
4. Должно открыться Mini App приложение

---

## 📱 Тестирование на мобильном

1. В Telegram Mobile найдите вашего бота
2. Нажмите на кнопку запуска приложения
3. Приложение откроется в полноэкранном режиме

---

## 🔧 Развертывание на production

### Frontend (Vercel)

```bash
cd ~/Desktop/tinder-tg-miniapp/frontend

# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel
```

Обновить переменные окружения в Vercel Dashboard.

### Backend (Railway или Heroku)

#### Railway:

```bash
cd ~/Desktop/tinder-tg-miniapp/backend

# Установить Railway CLI
npm i -g @railway/cli

# Login
railway login

# Инициализировать проект
railway init

# Деплой
railway up
```

#### Heroku:

```bash
cd ~/Desktop/tinder-tg-miniapp/backend

# Установить Heroku CLI
npm install -g heroku

# Login
heroku login

# Создать приложение
heroku create your-app-name

# Добавить переменные окружения
heroku config:set TELEGRAM_BOT_TOKEN=...
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_ANON_KEY=...

# Деплой
git push heroku main
```

---

## 🐛 Troubleshooting

### "Cannot find module 'zustand'" / "Cannot find module 'axios'"

```bash
npm install
```

### "CORS error" / "Cannot connect to backend"

Убедитесь, что:
1. Backend запущен на `http://localhost:5000`
2. Frontend имеет правильный `REACT_APP_API_URL`
3. CORS включен в backend (уже есть в коде)

### "Telegram WebApp is not defined"

Приложение должно запускаться внутри Telegram, а не в браузере. Для тестирования в браузере используйте `localStorage` (см. API документацию).

### "Supabase connection error"

Проверьте:
1. `SUPABASE_URL` и `SUPABASE_ANON_KEY` корректны
2. Интернет соединение
3. Supabase проект активен

---

## 📝 Следующие шаги

1. ✅ Базовая структура создана
2. ⏭️ Добавить real-time чат (Socket.io)
3. ⏭️ Система платежей (Stripe/Telegram Stars)
4. ⏭️ Реклама (Google AdMob)
5. ⏭️ Мобильная оптимизация
6. ⏭️ Запуск в социальные сети (TikTok, Instagram)

---

## 🆘 Нужна помощь?

- 📖 Читайте `docs/API_DOCUMENTATION.md`
- 📖 Читайте `docs/DATABASE_SCHEMA.sql`
- 💬 Задавайте вопросы в чат

---

**Happy coding! 🚀**

# API Documentation — Tinder-like TG Mini App

## Base URL
```
http://localhost:5000
https://your-production-domain.com
```

## Authentication

Все запросы (кроме `/api/auth/telegram`) требуют заголовок:
```
Authorization: Bearer <token>
```

Token получается при авторизации через `/api/auth/telegram`.

---

## 🔐 Authentication

### POST /api/auth/telegram
Авторизация пользователя через Telegram WebApp.

**Request Body:**
```json
{
  "id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://...",
  "auth_date": 1690000000,
  "hash": "abc123..."
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "telegram_id": 123456789,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "age": null,
    "bio": null,
    "photo_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 👤 Profiles

### GET /api/profiles/:id
Получить профиль пользователя.

**Response (200):**
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "age": 22,
  "bio": "Люблю путешествия и кино",
  "photos": ["https://...", "https://..."],
  "interests": ["кино", "путешествия", "спорт"],
  "created_at": "2024-01-01T00:00:00Z"
}
```

### PUT /api/profiles/:id
Обновить собственный профиль.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "age": 22,
  "bio": "Новое описание",
  "photos": ["https://..."],
  "interests": ["кино", "путешествия"]
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "first_name": "John",
  ...
}
```

### GET /api/profiles/discover?limit=10
Получить профили для свайпов (исключая уже оцененные).

**Query Parameters:**
- `user_id` (required) — ID пользователя
- `limit` (optional, default: 10) — количество профилей

**Response (200):**
```json
{
  "profiles": [
    {
      "id": "uuid",
      "first_name": "Alice",
      "age": 20,
      "bio": "...",
      "photos": ["https://..."]
    }
  ]
}
```

---

## ❤️ Interactions (Likes/Dislikes)

### POST /api/interactions/like
Лайкнуть профиль.

**Request Body:**
```json
{
  "user_id": "uuid",
  "target_user_id": "uuid"
}
```

**Response (200):**
```json
{
  "interaction": {
    "id": "uuid",
    "user_id": "uuid",
    "target_user_id": "uuid",
    "action": "like",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "isMatch": false,
  "match": null
}
```

Если есть взаимный лайк (матч):
```json
{
  "interaction": {...},
  "isMatch": true,
  "match": {
    "id": "uuid",
    "user1_id": "uuid",
    "user2_id": "uuid",
    "matched_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/interactions/dislike
Дизлайкнуть профиль.

**Request Body:**
```json
{
  "user_id": "uuid",
  "target_user_id": "uuid"
}
```

**Response (200):**
```json
{
  "interaction": {
    "id": "uuid",
    "user_id": "uuid",
    "target_user_id": "uuid",
    "action": "dislike",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 💕 Matches

### GET /api/matches/:user_id
Получить все матчи пользователя.

**Response (200):**
```json
{
  "matches": [
    {
      "id": "uuid",
      "user1_id": "uuid",
      "user2_id": "uuid",
      "matched_at": "2024-01-01T00:00:00Z",
      "user1": {
        "id": "uuid",
        "first_name": "John",
        "photo_url": "https://..."
      },
      "user2": {
        "id": "uuid",
        "first_name": "Alice",
        "photo_url": "https://..."
      }
    }
  ]
}
```

---

## 💬 Messages (Coming Soon)

### GET /api/messages/:match_id
Получить сообщения матча.

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

### POST /api/messages/:match_id
Отправить сообщение.

**Request Body:**
```json
{
  "text": "Привет!"
}
```

### WebSocket /ws/messages/:match_id
Real-time сообщения.

---

## 🏥 Health Check

### GET /api/health
Проверка статуса сервера.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "user_id required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid Telegram auth"
}
```

### 404 Not Found
```json
{
  "error": "Profile not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

**Бесплатные пользователи:**
- 20 свайпов в день
- 100 сообщений в день
- 10 матчей в месяц

**Премиум пользователи:**
- Неограниченные свайпы
- Неограниченные сообщения
- Неограниченные матчи

---

## Testing

### Telegram WebApp Test Mode

Для локального тестирования без Telegram:

```javascript
// В браузере console:
localStorage.setItem('token', 'test-token');
localStorage.setItem('user', JSON.stringify({
  id: 'test-uuid',
  telegram_id: 123456789,
  first_name: 'Test'
}));
```

Затем перезагрузить страницу.

---

## Changelog

### v1.0.0 (Initial Release)
- Auth через Telegram
- Profiles (create, read, update)
- Interactions (like, dislike)
- Matches

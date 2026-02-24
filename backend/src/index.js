import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import { sendNotification } from './bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Получить начало дня (3:00 МСК) для расчета дневного лимита
const getTodayStartMSK = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

// Config for Multer
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Supabase инициализация
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your_anon_key'
);

// ============ TELEGRAM AUTH ============

/**
 * Проверка подписи Telegram
 * @param {Object} data - Данные от Telegram Web App
 * @returns {boolean}
 */
function verifyTelegramAuth(initData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return false;
  }

  // Parse initData string to URLSearchParams
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');

  if (!hash) return false;

  urlParams.delete('hash');

  // Sort parameters alphabetically
  const keys = Array.from(urlParams.keys()).sort();
  const dataCheckString = keys.map(key => `${key}=${urlParams.get(key)}`).join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

/**
 * POST /api/auth/telegram
 * Регистрация/вход через Telegram
 */
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'Missing initData' });
    }

    // Проверяем подпись
    if (!verifyTelegramAuth(initData)) {
      return res.status(401).json({ error: 'Invalid Telegram auth' });
    }

    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    const auth_date = parseInt(urlParams.get('auth_date'), 10);

    if (!userStr || !auth_date) {
      return res.status(400).json({ error: 'Invalid user data in initData' });
    }

    const tgUser = JSON.parse(userStr);
    const { id, first_name, last_name, username, photo_url } = tgUser;

    // Проверяем, что auth_date не слишком старый (максимум 10 минут)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - auth_date > 600) {
      return res.status(401).json({ error: 'Auth data expired' });
    }

    // Ищем или создаём пользователя
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', id)
      .single();

    let user;

    if (existingUser) {
      // Обновляем данные пользователя только если они еще не были установлены (защита от перезаписи собственных данных)
      const updatePayload = {
        last_login: new Date(),
      };

      // Если у пользователя нет фото, берем из телеграма. Иначе - оставляем как есть.
      if (!existingUser.photos || existingUser.photos.length === 0) {
        updatePayload.photo_url = photo_url || existingUser.photo_url;
      }

      // Имя и фамилия обновляются, если они почему-то пустые, чтобы не стирать отредактированные.
      if (!existingUser.first_name) updatePayload.first_name = first_name;
      if (!existingUser.last_name) updatePayload.last_name = last_name;
      if (!existingUser.username) updatePayload.username = username;

      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('telegram_id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updated;
    } else {
      // Создаём нового пользователя
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            telegram_id: id,
            first_name,
            last_name,
            username,
            photo_url,
            created_at: new Date(),
            last_login: new Date(),
            notifications_enabled: true,
            show_in_search: true, // По умолчанию показываем в поиске
            is_banned: false
          },
        ])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    if (user && user.is_premium && user.premium_expires_at) {
      if (new Date(user.premium_expires_at) < new Date()) {
        user.is_premium = false;
        user.premium_expires_at = null;
        await supabase.from('users').update({ is_premium: false, premium_expires_at: null }).eq('id', user.id);
      }
    }

    res.json({
      success: true,
      user,
      token: Buffer.from(JSON.stringify(user)).toString('base64'),
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ПРОФИЛИ ============

/**
 * GET /api/profiles/discover?limit=10
 * Получить профили для свайпов (с исключением уже лайкнутых/дизлайкнутых)
 */
app.get('/api/profiles/discover', async (req, res) => {
  try {
    const userId = req.query.user_id;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
      return res.status(400).json({ error: 'user_id required' });
    }

    // Получаем самого юзера, чтобы узнать его настройки поиска
    const { data: currentUser } = await supabase
      .from('users')
      .select('search_gender, min_age, max_age, is_premium')
      .eq('id', userId)
      .single();

    // Получаем количество свайпов за сегодня
    const todayStart = getTodayStartMSK();
    const { count: swipeCount } = await supabase
      .from('interactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart);

    // Получаем профили, которые юзер уже оценил
    const { data: interactions } = await supabase
      .from('interactions')
      .select('target_user_id')
      .eq('user_id', userId);

    const excludedIds = interactions?.map((i) => i.target_user_id) || [];

    // Получаем те профили, которые СУПЕРЛАЙКНУЛИ текущего пользователя
    const { data: superlikesReceived } = await supabase
      .from('interactions')
      .select('user_id')
      .eq('target_user_id', userId)
      .eq('is_super_like', true);

    const superLikedMeIds = superlikesReceived?.map((i) => i.user_id) || [];

    // Строим запрос для новых профилей
    // Берем с запасом (100 человек), чтобы после фильтрации JS-ом что-то осталось
    let query = supabase
      .from('users')
      .select('id, first_name, last_name, age, bio, photos, gender, notifications_enabled, hide_age, hide_online_status, show_in_search, is_banned, created_at')
      .neq('id', userId)
      .or('is_banned.eq.false,is_banned.is.null') //Handle NULL is_banned
      .or('show_in_search.eq.true,show_in_search.is.null')
      .order('created_at', { ascending: false }) // Новые пользователи сверху!
      .limit(100);

    // Добавляем фильтры настроек, если они есть
    if (currentUser?.search_gender && currentUser.search_gender !== 'all') {
      query = query.eq('gender', currentUser.search_gender);
    }
    if (currentUser?.min_age) {
      query = query.gte('age', currentUser.min_age);
    }
    if (currentUser?.max_age) {
      query = query.lte('age', currentUser.max_age);
    }

    // Исключаем тех, кого уже оценили в БД (если их не слишком много)
    if (excludedIds.length > 0) {
      const limitedExcludedIds = excludedIds.slice(-200); // Reduce size to avoid URL limit
      // PostgREST syntax for NOT IN with multiple values
      query = query.not('id', 'in', `(${limitedExcludedIds.join(',')})`);
    }

    const { data: profiles, error } = await query;

    if (error) throw error;

    const filtered = profiles
      .filter((p) => !excludedIds.includes(p.id))
      .map(p => ({
        ...p,
        received_super_like: superLikedMeIds.includes(p.id)
      }));

    res.json({
      profiles: filtered,
      swipeCount: swipeCount || 0,
      isPremium: currentUser?.is_premium || false
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/profiles/:id
 * Получить полный профиль пользователя
 */
app.get('/api/profiles/:id', async (req, res) => {
  try {
    let { data: profile, error } = await supabase
      .from('users')
      .select('*, notifications_enabled') // Fetch notifications_enabled
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (profile.is_premium && profile.premium_expires_at) {
      if (new Date(profile.premium_expires_at) < new Date()) {
        profile.is_premium = false;
        profile.premium_expires_at = null;
        await supabase.from('users').update({ is_premium: false, premium_expires_at: null }).eq('id', profile.id);
      }
    }

    res.json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/profiles/:id
 * Обновить собственный профиль
 */
app.put('/api/profiles/:id', async (req, res) => {
  try {
    const {
      first_name, last_name, age, bio, photos, photo_url,
      gender, search_gender, min_age, max_age, onboarding_completed, notifications_enabled
    } = req.body;

    const { data: updated, error } = await supabase
      .from('users')
      .update({
        first_name, last_name, age, bio, photos, photo_url,
        gender, search_gender, min_age, max_age, onboarding_completed, notifications_enabled
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ПОКУПКА PREMIUM ============

/**
 * POST /api/profiles/:id/grant-premium
 * Имитирует успешную оплату через Stars и выдает +7 дней Premium
 */
app.post('/api/profiles/:id/grant-premium', async (req, res) => {
  try {
    const userId = req.params.id;
    let { data: profile } = await supabase.from('users').select('is_premium, premium_expires_at').eq('id', userId).single();
    if (!profile) return res.status(404).json({ error: 'User not found' });

    let newDate = new Date();
    if (profile.is_premium && profile.premium_expires_at && new Date(profile.premium_expires_at) > new Date()) {
      newDate = new Date(profile.premium_expires_at);
    }
    // Add 7 days
    newDate.setDate(newDate.getDate() + 7);

    const { data: updated, error } = await supabase
      .from('users')
      .update({ is_premium: true, premium_expires_at: newDate.toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (err) {
    console.error('Grant premium error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/profiles/:id/photo
 * Загрузить новое фото профиля
 */
app.post('/api/profiles/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${req.params.id}-${Date.now()}.${fileExt}`;

    // Загружаем в Supabase Storage (бакет "photos")
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      // Если бакет не существует или нет доступа, мы можем использовать заглушку для MVP
      // Но для продакшена нужен правильно настроенный бакет "photos" с публичным доступом.
      console.error('Supabase upload error (maybe bucket missing?):', error);
      return res.status(500).json({ error: 'Storage error. Did you create the "photos" bucket?' });
    }

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    // Обновляем фото в профиле
    const { data: user } = await supabase
      .from('users')
      .select('photos, photo_url')
      .eq('id', req.params.id)
      .single();

    const currentPhotos = user?.photos || [];
    currentPhotos.unshift(publicUrl);

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        photos: currentPhotos,
        photo_url: currentPhotos[0]
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updated);
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ СВАЙПЫ (LIKE/DISLIKE) ============

/**
 * POST /api/interactions/like
 * Лайкнуть профиль
 */
app.post('/api/interactions/like', async (req, res) => {
  try {
    const { user_id, target_user_id } = req.body;

    if (!user_id || !target_user_id) {
      return res
        .status(400)
        .json({ error: 'user_id and target_user_id required' });
    }

    // Проверка лимита свайпов для непремиум пользователей
    const { data: userRecord } = await supabase.from('users').select('is_premium').eq('id', user_id).single();
    if (!userRecord?.is_premium) {
      const todayStart = getTodayStartMSK();
      const { count: currentSwipes } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .gte('created_at', todayStart);

      if (currentSwipes >= 20) {
        return res.status(403).json({ error: 'Limit reached', limitExceeded: true });
      }
    }

    // Записываем лайк
    const { data: interaction, error: likeError } = await supabase
      .from('interactions')
      .insert([{ user_id, target_user_id, action: 'like' }])
      .select()
      .single();

    if (likeError) throw likeError;

    // Проверяем, может быть это матч?
    const { data: reverseInteraction } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', target_user_id)
      .eq('target_user_id', user_id)
      .eq('action', 'like')
      .single();

    if (reverseInteraction) {
      // Это матч! Создаём запись о матче
      const { data: match } = await supabase
        .from('matches')
        .insert([
          {
            user1_id: user_id,
            user2_id: target_user_id,
            matched_at: new Date(),
          },
        ])
        .select()
        .single();

      // Fetch profiles to send notification
      const { data: matchedProfiles } = await supabase
        .from('users')
        .select('id, telegram_id, first_name, notifications_enabled')
        .in('id', [user_id, target_user_id]);

      if (matchedProfiles && matchedProfiles.length === 2) {
        const u1 = matchedProfiles.find(p => p.id === user_id);
        const u2 = matchedProfiles.find(p => p.id === target_user_id);

        if (u1?.notifications_enabled) {
          sendNotification(u1.telegram_id, `У вас новый Match с ${u2.first_name || 'кем-то'}! ❤️\nЗайдите в приложение, чтобы начать общение.`);
        }
        if (u2?.notifications_enabled) {
          sendNotification(u2.telegram_id, `У вас новый Match с ${u1.first_name || 'кем-то'}! ❤️\nЗайдите в приложение, чтобы начать общение.`);
        }
      }

      return res.json({ interaction, match, isMatch: true });
    } else {
      // Just a like, notify the target user if they have notifications enabled
      const { data: targetUser } = await supabase
        .from('users')
        .select('telegram_id, notifications_enabled')
        .eq('id', target_user_id)
        .single();

      if (targetUser?.notifications_enabled) {
        sendNotification(targetUser.telegram_id, `Кому-то понравилась ваша анкета! 🔥\nЗайдите в приложение, чтобы узнать кто это.`);
      }

      return res.json({ interaction, isMatch: false });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/interactions/dislike
 * Дизлайкнуть профиль
 */
app.post('/api/interactions/dislike', async (req, res) => {
  try {
    const { user_id, target_user_id } = req.body;

    if (!user_id || !target_user_id) {
      return res
        .status(400)
        .json({ error: 'user_id and target_user_id required' });
    }

    // Проверка лимита свайпов для непремиум пользователей
    const { data: userRecord } = await supabase.from('users').select('is_premium').eq('id', user_id).single();
    if (!userRecord?.is_premium) {
      const todayStart = getTodayStartMSK();
      const { count: currentSwipes } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id)
        .gte('created_at', todayStart);

      if (currentSwipes >= 20) {
        return res.status(403).json({ error: 'Limit reached', limitExceeded: true });
      }
    }

    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert([{ user_id, target_user_id, action: 'dislike' }])
      .select()
      .single();

    if (error) throw error;
    res.json({ interaction });
  } catch (error) {
    console.error('Dislike error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ МАТЧИ ============

/**
 * GET /api/matches/:user_id
 * Получить все матчи пользователя
 */
app.get('/api/matches/:user_id', async (req, res) => {
  try {
    const userId = req.params.user_id;

    const { data: matches, error } = await supabase
      .from('matches')
      .select(
        'id, user1_id, user2_id, matched_at, user1:users!user1_id(*), user2:users!user2_id(*)'
      )
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) throw error;

    res.json({ matches });
  } catch (error) {
    console.error('Matches error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ TELEGRAM STARS ============

/**
 * POST /api/stars/invoice
 * Создать ссылку на оплату подписки / доп свайпов через Telegram Stars
 */
app.post('/api/stars/invoice', async (req, res) => {
  try {
    const { user_id, type } = req.body;
    let amount = 100; // 100 Stars
    let description = 'Премиум подписка на 7 дней';
    let payload = `premium_7days_${user_id}`;

    if (type === 'boost') {
      amount = 50;
      description = 'Буст профиля на 24 часа';
      payload = `boost_${user_id}`;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not set' });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Sloi',
        description,
        payload,
        provider_token: "", // Для Telegram Stars провайдер токен не нужен, оставляем пустым
        currency: 'XTR',
        prices: [{ label: 'Stars', amount: amount }]
      })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    res.json({ invoice_link: data.result });
  } catch (error) {
    console.error('Stars invoice error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ============ СТАТИКА ДЛЯ ПРОДАКШЕНА (RENDER) ============
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ============ СТАРТ СЕРВЕРА ============

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Bot ID: ${process.env.TELEGRAM_BOT_ID}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
function verifyTelegramAuth(data) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return false;
  }

  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  return hash === data.hash;
}

/**
 * POST /api/auth/telegram
 * Регистрация/вход через Telegram
 */
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { id, first_name, last_name, username, photo_url, auth_date, hash } =
      req.body;

    // Проверяем подпись
    if (!verifyTelegramAuth(req.body)) {
      return res.status(401).json({ error: 'Invalid Telegram auth' });
    }

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
      // Обновляем данные пользователя
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          first_name,
          last_name,
          username,
          photo_url,
          last_login: new Date(),
        })
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
          },
        ])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
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

    // Получаем профили, которые юзер уже оценил
    const { data: interactions } = await supabase
      .from('interactions')
      .select('target_user_id')
      .eq('user_id', userId);

    const excludedIds = interactions?.map((i) => i.target_user_id) || [];

    // Получаем новые профили (исключая себя и уже оцененных)
    const { data: profiles, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, age, bio, photos')
      .neq('id', userId)
      .limit(limit);

    if (error) throw error;

    const filtered = profiles.filter((p) => !excludedIds.includes(p.id));

    res.json({ profiles: filtered });
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
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

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
    const { first_name, last_name, age, bio, photos } = req.body;

    const { data: updated, error } = await supabase
      .from('users')
      .update({ first_name, last_name, age, bio, photos })
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

      return res.json({ interaction, match, isMatch: true });
    }

    res.json({ interaction, isMatch: false });
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

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ============ СТАРТ СЕРВЕРА ============

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Bot ID: ${process.env.TELEGRAM_BOT_ID}`);
});

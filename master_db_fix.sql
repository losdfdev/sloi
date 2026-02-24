-- ==========================================
-- MASTER FIX SCRIPT FOR SUPABASE
-- Скопируйте весь этот код и выполните в SQL Editor
-- ==========================================

-- 1. Таблица users: Добавляем ВСЕ новые колонки, если их вдруг нет
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS show_in_search BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hide_age BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_online_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 2. Таблица interactions: Добавляем флаг суперлайка
ALTER TABLE interactions
ADD COLUMN IF NOT EXISTS is_super_like BOOLEAN DEFAULT false;

-- 3. Создаем таблицу reports (Жалобы), если ее еще нет
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- КАК ВЫДАТЬ СЕБЕ АДМИНКУ И PREMIUM ЧЕРЕЗ SQL
-- ==========================================
-- Раскомментируйте (уберите тире -- в начале) и впишите свой telegram_id в код ниже, чтобы выдать себе права прямо скриптом:

-- UPDATE users 
-- SET is_admin = true, 
--     is_premium = true, 
--     premium_expires_at = '2099-12-31 23:59:59+00' 
-- WHERE telegram_id = 'ВАШ_ID_ТЕЛЕГРАМ';


-- Выполните этот скрипт в разделе SQL Editor внутри вашего Supabase

-- 1. Добавляем флаги администратора и блокировки
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 2. Создаем таблицу для Жалоб (Репортов)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Добавляем флаг Суперлайка в существующую таблицу взаимодействий
ALTER TABLE interactions
ADD COLUMN IF NOT EXISTS is_super_like BOOLEAN DEFAULT false;

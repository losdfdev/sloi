-- Выполните этот скрипт в разделе SQL Editor внутри вашего дашборда Supabase

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS show_in_search BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hide_age BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_online_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;

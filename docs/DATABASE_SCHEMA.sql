-- Tinder-like TG Mini App Database Schema
-- Для использования с Supabase PostgreSQL

-- ============ USERS TABLE ============
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100),
  age INT,
  bio TEXT,
  photo_url TEXT,
  photos TEXT[] DEFAULT '{}', -- Array of photo URLs
  interests TEXT[] DEFAULT '{}', -- Array of interests/tags
  created_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP DEFAULT now(),
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  banned_reason TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_premium ON users(is_premium);

-- ============ INTERACTIONS TABLE (Likes/Dislikes) ============
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL, -- 'like' or 'dislike'
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, target_user_id) -- Один лайк/дизлайк на пару пользователей
);

CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_target_user_id ON interactions(target_user_id);
CREATE INDEX idx_interactions_action ON interactions(action);

-- ============ MATCHES TABLE ============
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  unmatched_by UUID,
  unmatched_at TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_matched_at ON matches(matched_at DESC);

-- ============ MESSAGES TABLE ============
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP
);

CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============ BLOCKS TABLE ============
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(blocker_id, blocked_user_id)
);

CREATE INDEX idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked_user_id ON blocks(blocked_user_id);

-- ============ REPORTS TABLE ============
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP
);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_is_resolved ON reports(is_resolved);

-- ============ SUBSCRIPTIONS TABLE ============
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL, -- 'monthly', 'yearly', 'lifetime'
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'RUB',
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  payment_id VARCHAR(255),
  started_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============ ADS IMPRESSIONS TABLE ============
CREATE TABLE ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ad_id VARCHAR(255),
  ad_network VARCHAR(50), -- 'google_admob', 'yandex_ads'
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_ad_impressions_user_id ON ad_impressions(user_id);
CREATE INDEX idx_ad_impressions_created_at ON ad_impressions(created_at DESC);

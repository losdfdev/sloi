-- Ensure show_in_search and is_banned have proper defaults and values
ALTER TABLE users ALTER COLUMN show_in_search SET DEFAULT true;
UPDATE users SET show_in_search = true WHERE show_in_search IS NULL;

ALTER TABLE users ALTER COLUMN is_banned SET DEFAULT false;
UPDATE users SET is_banned = false WHERE is_banned IS NULL;

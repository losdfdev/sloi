-- CAUTION: This will delete ALL swipe history (likes, dislikes, superlikes) for ALL users.
-- This is used for completely resetting the discovery pool algorithm for testing.
TRUNCATE TABLE interactions;

-- Optionally, to delete matches as well (since they depend on interactions):
TRUNCATE TABLE matches;

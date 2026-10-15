-- Create sequences for atomic userId generation
CREATE SEQUENCE IF NOT EXISTS user_id_seq START WITH 100001;
CREATE SEQUENCE IF NOT EXISTS vendor_id_seq START WITH 100001;

-- Synchronize sequences with highest existing user and vendor IDs
SELECT setval('user_id_seq', (
  SELECT COALESCE(MAX(NULLIF(regexp_replace("userId", '^USR', ''), '')::bigint), 100000)
  FROM "User" WHERE "type" = 'USER'
));

SELECT setval('vendor_id_seq', (
  SELECT COALESCE(MAX(NULLIF(regexp_replace("userId", '^VND', ''), '')::bigint), 100000)
  FROM "User" WHERE "type" = 'VENDOR'
));

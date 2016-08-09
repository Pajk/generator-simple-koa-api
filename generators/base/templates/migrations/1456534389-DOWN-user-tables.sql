-- 1456534389 DOWN user tables

DROP TABLE facebook;

UPDATE "user" SET password='empty' WHERE password IS NULL;
ALTER TABLE "user" ALTER COLUMN password SET NOT NULL;

ALTER TABLE "user"
DROP COLUMN "address_id",
DROP COLUMN "deleted_at",
DROP COLUMN "reg_ip",
DROP COLUMN "updated_at",
DROP COLUMN "login_at",
DROP COLUMN "avatar_url";

DROP TABLE IF EXISTS "address";

DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;

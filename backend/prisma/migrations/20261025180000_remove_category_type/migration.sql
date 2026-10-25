CREATE TEMP TABLE "category_merge" AS
SELECT c."id" AS "old_id", k."keeper_id"
FROM "categories" c
JOIN (
  SELECT DISTINCT ON ("user_id", LOWER(TRIM("name")))
    "user_id",
    LOWER(TRIM("name")) AS "normalized_name",
    "id" AS "keeper_id"
  FROM "categories"
  ORDER BY "user_id", LOWER(TRIM("name")), ("budget" IS NULL), ("type" <> 'EXPENSE'), "created_at", "id"
) k ON k."user_id" = c."user_id" AND k."normalized_name" = LOWER(TRIM(c."name"))
WHERE c."id" <> k."keeper_id";

UPDATE "transactions" t
SET "category_id" = m."keeper_id"
FROM "category_merge" m
WHERE t."category_id" = m."old_id";

UPDATE "recurrences" r
SET "category_id" = m."keeper_id"
FROM "category_merge" m
WHERE r."category_id" = m."old_id";

DELETE FROM "categories" c
USING "category_merge" m
WHERE c."id" = m."old_id";

DROP TABLE "category_merge";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "type";

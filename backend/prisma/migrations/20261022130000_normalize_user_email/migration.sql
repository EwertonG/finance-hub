UPDATE "users" u
SET "email" = LOWER(TRIM(u."email"))
WHERE u."email" <> LOWER(TRIM(u."email"))
  AND NOT EXISTS (
    SELECT 1 FROM "users" o
    WHERE o."id" <> u."id" AND LOWER(TRIM(o."email")) = LOWER(TRIM(u."email"))
  );

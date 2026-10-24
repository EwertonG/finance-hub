-- AlterTable
ALTER TABLE "recurrences" ADD COLUMN "last_generated_period" INTEGER NOT NULL DEFAULT 0;

UPDATE "recurrences" r
SET "last_generated_period" = sub.period
FROM (
  SELECT t."recurrence_id",
         MAX(
           (EXTRACT(YEAR FROM t."date") - EXTRACT(YEAR FROM r2."start_date")) * 12
           + (EXTRACT(MONTH FROM t."date") - EXTRACT(MONTH FROM r2."start_date"))
           + 1
         )::int AS period
  FROM "transactions" t
  JOIN "recurrences" r2 ON r2."id" = t."recurrence_id"
  WHERE r2."kind" = 'SUBSCRIPTION'
  GROUP BY t."recurrence_id"
) sub
WHERE r."id" = sub."recurrence_id";

-- CreateIndex
CREATE UNIQUE INDEX "transactions_recurrence_id_installment_number_key" ON "transactions"("recurrence_id", "installment_number");

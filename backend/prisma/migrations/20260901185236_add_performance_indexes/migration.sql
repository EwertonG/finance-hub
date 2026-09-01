-- CreateIndex
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- CreateIndex
CREATE INDEX "debtors_user_id_date_idx" ON "debtors"("user_id", "date");

-- CreateIndex
CREATE INDEX "debtors_status_idx" ON "debtors"("status");

-- CreateIndex
CREATE INDEX "goal_contributions_goal_id_idx" ON "goal_contributions"("goal_id");

-- CreateIndex
CREATE INDEX "goals_user_id_idx" ON "goals"("user_id");

-- CreateIndex
CREATE INDEX "recurrences_user_id_kind_active_idx" ON "recurrences"("user_id", "kind", "active");

-- CreateIndex
CREATE INDEX "transactions_user_id_date_idx" ON "transactions"("user_id", "date");

-- CreateIndex
CREATE INDEX "transactions_recurrence_id_idx" ON "transactions"("recurrence_id");

-- CreateIndex
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");

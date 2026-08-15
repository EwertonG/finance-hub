-- AlterEnum
ALTER TYPE "DebtorStatus" ADD VALUE 'CHARGED';

-- AlterTable
ALTER TABLE "debtors" ADD COLUMN     "total_amount" DECIMAL(10,2),
ADD COLUMN     "transaction_id" TEXT;

-- AddForeignKey
ALTER TABLE "debtors" ADD CONSTRAINT "debtors_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

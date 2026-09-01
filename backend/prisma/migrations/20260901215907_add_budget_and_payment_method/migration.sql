-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "budget" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "recurrences" ADD COLUMN     "payment_method" "PaymentMethod";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "payment_method" "PaymentMethod";

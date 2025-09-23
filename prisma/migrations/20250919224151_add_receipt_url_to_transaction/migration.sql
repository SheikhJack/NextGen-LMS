-- AlterEnum
ALTER TYPE "public"."PaymentMethod" ADD VALUE 'OTHER';

-- AlterEnum
ALTER TYPE "public"."TransactionStatus" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "receiptUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."school_finance" (
    "id" TEXT NOT NULL DEFAULT 'school-general',
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_finance_pkey" PRIMARY KEY ("id")
);

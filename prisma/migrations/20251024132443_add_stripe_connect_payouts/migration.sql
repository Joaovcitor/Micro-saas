/*
  Warnings:

  - A unique constraint covering the columns `[stripeAccountId]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "platformFee" DOUBLE PRECISION,
ADD COLUMN     "platformFeeAmount" DOUBLE PRECISION,
ADD COLUMN     "storeAmount" DOUBLE PRECISION,
ADD COLUMN     "stripeTransferId" TEXT;

-- AlterTable
ALTER TABLE "public"."Store" ADD COLUMN     "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMethods" JSONB,
ADD COLUMN     "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeAccountStatus" TEXT;

-- CreateTable
CREATE TABLE "public"."StorePayout" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "stripePayoutId" TEXT,
    "stripeTransferId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "ordersCount" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorePayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorePayout_stripePayoutId_key" ON "public"."StorePayout"("stripePayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_stripeAccountId_key" ON "public"."Store"("stripeAccountId");

-- AddForeignKey
ALTER TABLE "public"."StorePayout" ADD CONSTRAINT "StorePayout_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

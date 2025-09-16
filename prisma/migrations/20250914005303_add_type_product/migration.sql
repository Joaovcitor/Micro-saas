/*
  Warnings:

  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PrroductType" AS ENUM ('PHYSICAL', 'SERVICE', 'MADE_TO_ORDER');

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "quantity",
ADD COLUMN     "stock" INTEGER DEFAULT 0,
ADD COLUMN     "type" "public"."PrroductType" NOT NULL DEFAULT 'PHYSICAL';

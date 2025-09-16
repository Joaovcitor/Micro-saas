/*
  Warnings:

  - The `type` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('PHYSICAL', 'SERVICE', 'MADE_TO_ORDER');

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "stock" DROP DEFAULT,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."ProductType" NOT NULL DEFAULT 'PHYSICAL';

-- DropEnum
DROP TYPE "public"."PrroductType";

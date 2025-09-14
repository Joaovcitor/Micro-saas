-- CreateEnum
CREATE TYPE "public"."MetodoPagamento" AS ENUM ('PIX', 'CARTAO', 'DINHEIRO');

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "enderecoEntrega" TEXT;

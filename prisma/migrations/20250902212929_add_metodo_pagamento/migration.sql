-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "metodoPagamento" "public"."MetodoPagamento" NOT NULL DEFAULT 'PIX';

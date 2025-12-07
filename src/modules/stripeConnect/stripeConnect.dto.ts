import { z } from 'zod';

// DTO para criar conta conectada
export const CreateConnectedAccountSchema = z.object({
  storeId: z.string().uuid('ID da loja deve ser um UUID válido'),
  email: z.string().email('Email deve ser válido'),
  country: z.string().length(2, 'Código do país deve ter 2 caracteres').optional().default('BR'),
  businessType: z.enum(['individual', 'company']).optional().default('individual'),
  refreshUrl: z.string().url('URL de refresh deve ser válida'),
  returnUrl: z.string().url('URL de retorno deve ser válida'),
});

export type CreateConnectedAccountDto = z.infer<typeof CreateConnectedAccountSchema>;

// DTO para criar link de onboarding
export const CreateOnboardingLinkSchema = z.object({
  storeId: z.string().uuid('ID da loja deve ser um UUID válido'),
  refreshUrl: z.string().url('URL de refresh deve ser válida'),
  returnUrl: z.string().url('URL de retorno deve ser válida'),
});

export type CreateOnboardingLinkDto = z.infer<typeof CreateOnboardingLinkSchema>;

// DTO para criar Payment Intent com transferência
export const CreatePaymentIntentWithTransferSchema = z.object({
  amount: z.number().int().positive('Valor deve ser um número inteiro positivo'),
  currency: z.string().length(3, 'Moeda deve ter 3 caracteres').optional().default('brl'),
  storeId: z.string().uuid('ID da loja deve ser um UUID válido'),
  orderId: z.string().uuid('ID do pedido deve ser um UUID válido'),
  customerEmail: z.string().email('Email do cliente deve ser válido'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  platformFeePercent: z.number().min(0).max(100).optional().default(5),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type CreatePaymentIntentWithTransferDto = z.infer<typeof CreatePaymentIntentWithTransferSchema>;

// DTO para buscar payouts
export const GetStorePayoutsSchema = z.object({
  storeId: z.string().uuid('ID da loja deve ser um UUID válido'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export type GetStorePayoutsDto = z.infer<typeof GetStorePayoutsSchema>;

// DTO para estatísticas financeiras
export const GetFinancialStatsSchema = z.object({
  storeId: z.string().uuid('ID da loja deve ser um UUID válido'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type GetFinancialStatsDto = z.infer<typeof GetFinancialStatsSchema>;

// DTO para webhook de conta atualizada
export const AccountUpdatedWebhookSchema = z.object({
  accountId: z.string().min(1, 'Account ID é obrigatório'),
});

export type AccountUpdatedWebhookDto = z.infer<typeof AccountUpdatedWebhookSchema>;

// DTO para webhook de transferência criada
export const TransferCreatedWebhookSchema = z.object({
  transferId: z.string().min(1, 'Transfer ID é obrigatório'),
});

export type TransferCreatedWebhookDto = z.infer<typeof TransferCreatedWebhookSchema>;

// DTO para webhook de payout pago
export const PayoutPaidWebhookSchema = z.object({
  payoutId: z.string().min(1, 'Payout ID é obrigatório'),
});

export type PayoutPaidWebhookDto = z.infer<typeof PayoutPaidWebhookSchema>;

// Response DTOs
export interface ConnectedAccountResponse {
  id: string;
  storeId: string;
  stripeAccountId: string;
  stripeAccountStatus: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  paymentMethods: string[];
  onboardingUrl?: string;
  dashboardUrl?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  transferAmount: number;
  platformFeeAmount: number;
}

export interface StorePayoutsResponse {
  payouts: StorePayout[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StorePayout {
  id: string;
  storeId: string;
  stripePayoutId: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialStatsResponse {
  totalRevenue: number;
  platformFees: number;
  storeEarnings: number;
  totalOrders: number;
  averageOrderValue: number;
  payoutsReceived: number;
}

// DTO para validação de parâmetros de rota
export const StoreIdParamSchema = z.object({
  storeId: z.string().uuid('ID da loja deve ser um UUID válido'),
});

export type StoreIdParamDto = z.infer<typeof StoreIdParamSchema>;

// DTO para query parameters de paginação
export const PaginationQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1).max(100)).optional().default(10),
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;

// DTO para query parameters de período
export const DateRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Data de início deve ser anterior à data de fim',
});

export type DateRangeQueryDto = z.infer<typeof DateRangeQuerySchema>;
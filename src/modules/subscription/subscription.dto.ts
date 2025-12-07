import { z } from 'zod';
import { PlanType, PlanInterval, SubscriptionStatus } from '@prisma/client';

// DTO para criar assinatura
export const CreateSubscriptionSchema = z.object({
  planId: z.string().uuid('ID do plano deve ser um UUID válido'),
  storeId: z.string().uuid('ID da loja deve ser um UUID válido'),
  paymentMethodId: z.string().optional(),
});

export type CreateSubscriptionDto = z.infer<typeof CreateSubscriptionSchema>;

// DTO para atualizar assinatura
export const UpdateSubscriptionSchema = z.object({
  planId: z.string().uuid('ID do plano deve ser um UUID válido').optional(),
  status: z.nativeEnum(SubscriptionStatus).optional(),
});

export type UpdateSubscriptionDto = z.infer<typeof UpdateSubscriptionSchema>;

// DTO para cancelar assinatura
export const CancelSubscriptionSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório').max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
  cancelAtPeriodEnd: z.boolean().default(true),
});

export type CancelSubscriptionDto = z.infer<typeof CancelSubscriptionSchema>;

// DTO para criar plano de assinatura
export const CreatePlanSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição deve ter no máximo 500 caracteres'),
  type: z.nativeEnum(PlanType),
  interval: z.nativeEnum(PlanInterval),
  price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  stripePriceId: z.string().optional(),
  stripeProductId: z.string().optional(),
  features: z.object({
    maxProducts: z.number().int(),
    maxOrders: z.number().int(),
    maxStorage: z.number().int(),
    customDomain: z.boolean(),
    premiumThemes: z.boolean(),
    analytics: z.boolean(),
    prioritySupport: z.boolean(),
  }),
  isActive: z.boolean().default(true),
});

export type CreatePlanDto = z.infer<typeof CreatePlanSchema>;

// DTO para atualizar plano
export const UpdatePlanSchema = CreatePlanSchema.partial();
export type UpdatePlanDto = z.infer<typeof UpdatePlanSchema>;

// DTO para filtros de busca
export const SubscriptionFiltersSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus).optional(),
  planType: z.nativeEnum(PlanType).optional(),
  storeId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type SubscriptionFiltersDto = z.infer<typeof SubscriptionFiltersSchema>;

// DTO para resposta de assinatura
export interface SubscriptionResponseDto {
  id: string;
  storeId: string;
  planId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  plan: {
    id: string;
    name: string;
    description: string;
    type: PlanType;
    interval: PlanInterval;
    price: number;
    features: any;
  };
  store: {
    id: string;
    name: string;
    subdomain: string;
  };
}

// DTO para resposta de plano
export interface PlanResponseDto {
  id: string;
  name: string;
  description: string;
  type: PlanType;
  interval: PlanInterval;
  price: number;
  stripePriceId?: string;
  stripeProductId?: string;
  features: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para estatísticas de uso
export interface UsageStatsDto {
  storeId: string;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  usage: {
    products: {
      current: number;
      limit: number;
      percentage: number;
    };
    orders: {
      current: number;
      limit: number;
      percentage: number;
    };
    storage: {
      current: number; // em MB
      limit: number; // em MB
      percentage: number;
    };
  };
  plan: {
    name: string;
    type: PlanType;
    features: any;
  };
}

// DTO para checkout de assinatura
export const SubscriptionCheckoutSchema = z.object({
  planId: z.string().uuid('ID do plano deve ser um UUID válido'),
  storeId: z.string().uuid('ID da loja deve ser um UUID válido'),
  successUrl: z.string().url('URL de sucesso deve ser válida'),
  cancelUrl: z.string().url('URL de cancelamento deve ser válida'),
  trialDays: z.number().int().min(0).max(30).optional(),
});

export type SubscriptionCheckoutDto = z.infer<typeof SubscriptionCheckoutSchema>;
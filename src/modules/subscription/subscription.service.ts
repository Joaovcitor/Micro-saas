import { PrismaClient, SubscriptionStatus, PlanType } from '@prisma/client';
import Stripe from 'stripe';
import { 
  CreateSubscriptionDto, 
  UpdateSubscriptionDto, 
  CancelSubscriptionDto,
  CreatePlanDto,
  UpdatePlanDto,
  SubscriptionFiltersDto,
  SubscriptionResponseDto,
  PlanResponseDto,
  UsageStatsDto,
  SubscriptionCheckoutDto
} from './subscription.dto';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export class SubscriptionService {
  // Buscar todos os planos ativos
  async getPlans(): Promise<PlanResponseDto[]> {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [
        { type: 'asc' },
        { price: 'asc' }
      ],
    });

    return plans.map(plan => ({
      ...plan,
      description: plan.name, // Using name as description fallback
      stripePriceId: plan.stripePriceId ?? undefined,
    }));
  }

  // Buscar plano por ID
  async getPlanById(planId: string): Promise<PlanResponseDto | null> {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    return plan ? {
      ...plan,
      description: plan.name, // Using name as description fallback
      stripePriceId: plan.stripePriceId ?? undefined,
    } : null;
  }

  // Criar novo plano (admin)
  async createPlan(data: CreatePlanDto): Promise<PlanResponseDto> {
    const plan = await prisma.subscriptionPlan.create({
      data,
    });

    return {
      ...plan,
      description: plan.name, // Using name as description fallback
      stripePriceId: plan.stripePriceId ?? undefined,
    };
  }

  // Atualizar plano (admin)
  async updatePlan(planId: string, data: UpdatePlanDto): Promise<PlanResponseDto> {
    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });

    return {
      ...plan,
      description: plan.name, // Using name as description fallback
      stripePriceId: plan.stripePriceId ?? undefined,
    };
  }

  // Buscar assinatura por loja
  async getSubscriptionByStore(storeId: string): Promise<SubscriptionResponseDto | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { 
        storeId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE]
        }
      },
      include: {
        plan: true,
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) return null;

    return {
      ...subscription,
      stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
      stripeCustomerId: subscription.stripeCustomerId || undefined,
      plan: {
        ...subscription.plan,
        description: subscription.plan.name, // Using name as description fallback
      },
      store: {
        ...subscription.store,
        subdomain: subscription.store.subdomain || '',
      },
    };
  }

  // Buscar todas as assinaturas com filtros
  async getSubscriptions(filters: SubscriptionFiltersDto): Promise<{
    subscriptions: SubscriptionResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { status, planType, storeId, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) where.status = status;
    if (storeId) where.storeId = storeId;
    if (planType) where.plan = { type: planType };

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          plan: true,
          store: {
            select: {
              id: true,
              name: true,
              subdomain: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions: subscriptions.map(subscription => ({
        ...subscription,
        stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
        stripeCustomerId: subscription.stripeCustomerId || undefined,
        plan: {
          ...subscription.plan,
          description: subscription.plan.name, // Using name as description fallback
        },
        store: {
          ...subscription.store,
          subdomain: subscription.store.subdomain || '',
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Criar checkout de assinatura
  async createSubscriptionCheckout(data: SubscriptionCheckoutDto): Promise<{ url: string }> {
    const { planId, storeId, successUrl, cancelUrl, trialDays } = data;

    // Buscar plano
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    if (!plan.stripePriceId) {
      throw new Error('Plano não configurado no Stripe');
    }

    // Buscar loja
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });

    if (!store) {
      throw new Error('Loja não encontrada');
    }

    // Criar ou buscar customer no Stripe
    let customerId = store.owner.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: store.owner.email,
        name: store.owner.name,
        metadata: {
          storeId: store.id,
          userId: store.owner.id,
        },
      });

      customerId = customer.id;

      // Atualizar usuário com customer ID
      await prisma.user.update({
        where: { id: store.owner.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Criar sessão de checkout
    const sessionData: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        storeId,
        planId,
      },
    };

    // Adicionar trial se especificado
    if (trialDays && trialDays > 0) {
      sessionData.subscription_data = {
        trial_period_days: trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    if (!session.url) {
      throw new Error('Erro ao criar sessão de checkout');
    }

    return { url: session.url };
  }

  // Criar assinatura (chamado pelo webhook)
  async createSubscription(data: CreateSubscriptionDto & {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    status: SubscriptionStatus;
  }): Promise<SubscriptionResponseDto> {
    const subscription = await prisma.subscription.create({
      data,
      include: {
        plan: true,
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          }
        }
      },
    });

    // Criar registro de uso inicial
    await this.createInitialUsage(data.storeId, data.planId);

    return {
      ...subscription,
      stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
      stripeCustomerId: subscription.stripeCustomerId || undefined,
      plan: {
        ...subscription.plan,
        description: subscription.plan.name, // Using name as description fallback
      },
      store: {
        ...subscription.store,
        subdomain: subscription.store.subdomain || '',
      },
    };
  }

  // Atualizar assinatura
  async updateSubscription(subscriptionId: string, data: UpdateSubscriptionDto): Promise<SubscriptionResponseDto> {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data,
      include: {
        plan: true,
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          }
        }
      },
    });

    return {
      ...subscription,
      stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
      stripeCustomerId: subscription.stripeCustomerId || undefined,
      plan: {
        ...subscription.plan,
        description: subscription.plan.name, // Using name as description fallback
      },
      store: {
        ...subscription.store,
        subdomain: subscription.store.subdomain || '',
      },
    };
  }

  // Cancelar assinatura
  async cancelSubscription(storeId: string, data: CancelSubscriptionDto): Promise<SubscriptionResponseDto> {
    const subscription = await this.getSubscriptionByStore(storeId);
    
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    // Cancelar no Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: data.cancelAtPeriodEnd,
        metadata: {
          cancelReason: data.reason || 'Cancelado pelo usuário',
        },
      });
    }

    // Atualizar no banco
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        status: data.cancelAtPeriodEnd ? SubscriptionStatus.ACTIVE : SubscriptionStatus.CANCELED,
      },
      include: {
        plan: true,
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          }
        }
      },
    });

    return {
      ...updatedSubscription,
      stripeSubscriptionId: updatedSubscription.stripeSubscriptionId || undefined,
      stripeCustomerId: updatedSubscription.stripeCustomerId || undefined,
      plan: {
        ...updatedSubscription.plan,
        description: updatedSubscription.plan.name, // Using name as description fallback
      },
      store: {
        ...updatedSubscription.store,
        subdomain: updatedSubscription.store.subdomain || '',
      },
    };
  }

  // Buscar estatísticas de uso
  async getUsageStats(storeId: string): Promise<UsageStatsDto> {
    const subscription = await this.getSubscriptionByStore(storeId);
    
    if (!subscription) {
      throw new Error('Assinatura não encontrada');
    }

    // Buscar uso atual
    const usage = await prisma.planUsage.findFirst({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    // Contar produtos, pedidos e calcular storage
    const [productCount, orderCount] = await Promise.all([
      prisma.product.count({ where: { storeId } }),
      prisma.order.count({ 
        where: { 
          storeId,
          createdAt: {
            gte: subscription.currentPeriodStart,
            lte: subscription.currentPeriodEnd,
          }
        } 
      }),
    ]);

    // Calcular storage (simplificado - pode ser melhorado)
    const storageUsed = await this.calculateStorageUsage(storeId);

    const planFeatures = subscription.plan.features as any;
    
    return {
      storeId,
      currentPeriod: {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
      },
      usage: {
        products: {
          current: productCount,
          limit: planFeatures.maxProducts === -1 ? Infinity : planFeatures.maxProducts,
          percentage: planFeatures.maxProducts === -1 ? 0 : (productCount / planFeatures.maxProducts) * 100,
        },
        orders: {
          current: orderCount,
          limit: planFeatures.maxOrders === -1 ? Infinity : planFeatures.maxOrders,
          percentage: planFeatures.maxOrders === -1 ? 0 : (orderCount / planFeatures.maxOrders) * 100,
        },
        storage: {
          current: storageUsed,
          limit: planFeatures.maxStorage === -1 ? Infinity : planFeatures.maxStorage,
          percentage: planFeatures.maxStorage === -1 ? 0 : (storageUsed / planFeatures.maxStorage) * 100,
        },
      },
      plan: {
        name: subscription.plan.name,
        type: subscription.plan.type,
        features: planFeatures,
      },
    };
  }

  // Verificar se pode criar produto
  async canCreateProduct(storeId: string): Promise<boolean> {
    const stats = await this.getUsageStats(storeId);
    return stats.usage.products.current < stats.usage.products.limit;
  }

  // Verificar se pode criar pedido
  async canCreateOrder(storeId: string): Promise<boolean> {
    const stats = await this.getUsageStats(storeId);
    return stats.usage.orders.current < stats.usage.orders.limit;
  }

  // Verificar se pode usar storage
  async canUseStorage(storeId: string, additionalMB: number): Promise<boolean> {
    const stats = await this.getUsageStats(storeId);
    return (stats.usage.storage.current + additionalMB) <= stats.usage.storage.limit;
  }

  // Criar uso inicial
  private async createInitialUsage(storeId: string, planId: string): Promise<void> {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    await prisma.planUsage.create({
      data: {
        storeId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        productsCount: 0,
        ordersCount: 0,
        storageUsed: 0,
      },
    });
  }

  // Calcular uso de storage (simplificado)
  private async calculateStorageUsage(storeId: string): Promise<number> {
    // Aqui você pode implementar a lógica real de cálculo de storage
    // Por exemplo, somar o tamanho de todas as imagens da loja
    const photos = await prisma.photo.findMany({
      where: {
        product: {
          storeId,
        },
      },
    });

    // Assumindo que cada foto tem ~500KB em média
    return photos.length * 0.5; // MB
  }

  // Atualizar uso mensal (para ser chamado por cron job)
  async updateMonthlyUsage(storeId: string): Promise<void> {
    const subscription = await this.getSubscriptionByStore(storeId);
    
    if (!subscription) return;

    const [productCount, orderCount] = await Promise.all([
      prisma.product.count({ where: { storeId } }),
      prisma.order.count({ 
        where: { 
          storeId,
          createdAt: {
            gte: subscription.currentPeriodStart,
            lte: subscription.currentPeriodEnd,
          }
        } 
      }),
    ]);

    const storageUsed = await this.calculateStorageUsage(storeId);

    await prisma.planUsage.upsert({
      where: {
        storeId_month_year: {
          storeId,
          month: subscription.currentPeriodStart.getMonth() + 1,
          year: subscription.currentPeriodStart.getFullYear(),
        },
      },
      update: {
        productsCount: productCount,
        ordersCount: orderCount,
        storageUsed,
      },
      create: {
        storeId,
        month: subscription.currentPeriodStart.getMonth() + 1,
        year: subscription.currentPeriodStart.getFullYear(),
        productsCount: productCount,
        ordersCount: orderCount,
        storageUsed,
      },
    });
  }
}
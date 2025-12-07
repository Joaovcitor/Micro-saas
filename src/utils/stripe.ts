import Stripe from "stripe";
import prisma from "../prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2025-08-27.basil',
});

// Funções existentes para compatibilidade
export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({
    email,
  });
  return customers.data[0];
};

export const createStripeCustomer = async (data: {
  email: string;
  name?: string;
}) => {
  const customer = await getStripeCustomerByEmail(data?.email);
  if (customer) {
    return customer;
  }
  return stripe.customers.create({
    email: data?.email,
    name: data?.name,
  });
};

// Função atualizada para suporte a múltiplos planos
export const generateCheckout = async (
  userId: string, 
  email: string, 
  priceId?: string
) => {
  try {
    const customer = await createStripeCustomer({
      email,
    });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      client_reference_id: userId,
      customer: customer.id,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      line_items: [
        {
          price: priceId || process.env.STRIPE_ID_PLAIN,
          quantity: 1,
        },
      ],
    });
    return {
      url: session.url,
    };
  } catch (e: any) {
    console.log(e);
  }
};

// Novas funções para SaaS

// Criar ou buscar customer para uma loja
export const createOrGetStoreCustomer = async (data: {
  email: string;
  name?: string;
  storeId: string;
  storeName: string;
}): Promise<Stripe.Customer> => {
  const existingCustomer = await getStripeCustomerByEmail(data.email);
  
  if (existingCustomer) {
    return existingCustomer;
  }

  return stripe.customers.create({
    email: data.email,
    name: data.name,
    metadata: {
      storeId: data.storeId,
      storeName: data.storeName,
    },
  });
};

// Criar sessão de checkout para assinatura SaaS
export const createSubscriptionCheckout = async (data: {
  customerId: string;
  priceId: string;
  storeId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> => {
  const sessionData: Stripe.Checkout.SessionCreateParams = {
    customer: data.customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: data.priceId,
        quantity: 1,
      },
    ],
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    client_reference_id: data.userId,
    metadata: {
      storeId: data.storeId,
      userId: data.userId,
      ...data.metadata,
    },
  };

  if (data.trialPeriodDays) {
    sessionData.subscription_data = {
      trial_period_days: data.trialPeriodDays,
    };
  }

  return stripe.checkout.sessions.create(sessionData);
};

// Criar portal do cliente para gerenciar assinatura
export const createCustomerPortal = async (data: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> => {
  return stripe.billingPortal.sessions.create({
    customer: data.customerId,
    return_url: data.returnUrl,
  });
};

// Atualizar assinatura
export const updateSubscription = async (
  subscriptionId: string,
  updates: Partial<Stripe.SubscriptionUpdateParams>
): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.update(subscriptionId, updates);
};

// Cancelar assinatura
export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> => {
  if (cancelAtPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return stripe.subscriptions.cancel(subscriptionId);
  }
};

// Buscar assinatura
export const getSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.retrieve(subscriptionId);
};

// Buscar todas as assinaturas de um customer
export const getCustomerSubscriptions = async (
  customerId: string
): Promise<Stripe.Subscription[]> => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
  });
  return subscriptions.data;
};

// Criar produto no Stripe
export const createStripeProduct = async (data: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Product> => {
  return stripe.products.create({
    name: data.name,
    description: data.description,
    metadata: data.metadata,
  });
};

// Criar preço no Stripe
export const createStripePrice = async (data: {
  productId: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Price> => {
  return stripe.prices.create({
    product: data.productId,
    unit_amount: data.unitAmount,
    currency: data.currency,
    recurring: {
      interval: data.interval,
      interval_count: data.intervalCount || 1,
    },
    metadata: data.metadata,
  });
};

// Webhook handlers atualizados

export const handleCheckoutSessionCompleted = async (event: {
  data: { object: Stripe.Checkout.Session };
}) => {
  const session = event.data.object;
  const userId = session.client_reference_id as string;
  const stripeSubscriptionId = session.subscription as string;
  const stripeCustomerId = session.customer as string;
  const storeId = session.metadata?.storeId;

  if (session.status !== "complete") return;

  if (!userId || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error(
      "userId, stripeSubscriptionId, stripeCustomerId são obrigatórios"
    );
  }

  try {
    // Buscar a assinatura no Stripe para obter mais detalhes
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    
    if (storeId) {
      // Atualizar assinatura da loja
      await prisma.subscription.upsert({
        where: { storeId },
        update: {
          stripeSubscriptionId,
          stripeCustomerId,
          status: subscription.status.toUpperCase() as any,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        },
        create: {
          storeId,
          stripeSubscriptionId,
          stripeCustomerId,
          status: subscription.status.toUpperCase() as any,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          planId: '', // Será atualizado pelo webhook de subscription
        },
      });
    } else {
      // Compatibilidade com sistema antigo
      const userExist = await prisma.user.findFirst({
        where: { id: userId },
      });

      if (!userExist) {
        throw new Error("Usuário não encontrado");
      }

      await prisma.user.update({
        where: { id: userExist.id },
        data: {
          stripeCustomerId,
        },
      });
    }
  } catch (error) {
    console.error('Erro ao processar checkout session completed:', error);
    throw error;
  }
};

export const handleSubscriptionUpdated = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const subscription = event.data.object;
  const stripeSubscriptionId = subscription.id;
  const stripeCustomerId = subscription.customer as string;
  const status = subscription.status;

  try {
    // Buscar assinatura no banco
    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (dbSubscription) {
      // Mapear status do Stripe para enum do Prisma
      let prismaStatus: string;
      switch (status.toLowerCase()) {
        case 'trialing':
          prismaStatus = 'TRIALING';
          break;
        case 'active':
          prismaStatus = 'ACTIVE';
          break;
        case 'past_due':
          prismaStatus = 'PAST_DUE';
          break;
        case 'canceled':
          prismaStatus = 'CANCELED';
          break;
        case 'incomplete':
          prismaStatus = 'INCOMPLETE';
          break;
        case 'incomplete_expired':
          prismaStatus = 'INCOMPLETE_EXPIRED';
          break;
        case 'unpaid':
          prismaStatus = 'UNPAID';
          break;
        default:
          prismaStatus = 'INCOMPLETE';
      }

      // Atualizar assinatura SaaS
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: prismaStatus as any,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        },
      });
    } else {
      // Compatibilidade com sistema antigo
      const userExist = await prisma.user.findFirst({
        where: { stripeCustomerId },
      });

      if (userExist) {
        await prisma.user.update({
          where: { id: userExist.id },
          data: {
            // Campo removido do schema
          },
        });
      }
    }
  } catch (error) {
    console.error('Erro ao processar subscription updated:', error);
    throw error;
  }
};

export const handleSubscriptionDeleted = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const subscription = event.data.object;
  const stripeSubscriptionId = subscription.id;
  const stripeCustomerId = subscription.customer as string;

  try {
    // Buscar assinatura no banco
    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (dbSubscription) {
      // Atualizar assinatura SaaS
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
        },
      });
    } else {
      // Compatibilidade com sistema antigo
      const userExist = await prisma.user.findFirst({
        where: { stripeCustomerId },
      });

      if (userExist) {
        await prisma.user.update({
          where: { id: userExist.id },
          data: {
            // Removendo campo que não existe no schema
          },
        });
      }
    }
  } catch (error) {
    console.error('Erro ao processar subscription deleted:', error);
    throw error;
  }
};

// Funções legadas mantidas para compatibilidade
export const handleSubscriptionSessionCompleted = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  return handleSubscriptionUpdated(event);
};

export const handleCancelPlan = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  return handleSubscriptionDeleted(event);
};

export const handleCancelSubscription = async (idSubscriptions: string) => {
  return cancelSubscription(idSubscriptions, true);
};

export const createPortalCustomer = async (idCustomer: string) => {
  return createCustomerPortal({
    customerId: idCustomer,
    returnUrl: process.env.FRONTEND_URL || "http://localhost:3000/",
  });
};

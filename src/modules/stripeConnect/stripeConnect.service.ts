import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export interface CreateConnectedAccountDto {
  storeId: string;
  email: string;
  country?: string;
  businessType?: 'individual' | 'company';
  refreshUrl: string;
  returnUrl: string;
}

export interface ConnectedAccountInfo {
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

export interface PaymentIntentWithTransferDto {
  amount: number;
  currency: string;
  storeId: string;
  orderId: string;
  customerEmail: string;
  description: string;
  platformFeePercent?: number;
  metadata?: Record<string, string>;
}

export class StripeConnectService {
  // Criar conta conectada
  async createConnectedAccount(data: CreateConnectedAccountDto): Promise<ConnectedAccountInfo> {
    const { storeId, email, country = 'BR', businessType = 'individual', refreshUrl, returnUrl } = data;

    // Verificar se a loja existe
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });

    if (!store) {
      throw new Error('Loja não encontrada');
    }

    // Verificar se já existe uma conta conectada
    if (store.stripeAccountId) {
      throw new Error('Loja já possui conta Stripe Connect');
    }

    try {
      // Criar conta no Stripe
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email,
        business_type: businessType,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          storeId,
          ownerEmail: store.owner.email,
        },
      });

      // Criar link de onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      // Atualizar loja no banco
      const updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: {
          stripeAccountId: account.id,
          stripeAccountStatus: 'PENDING',
          payoutsEnabled: false,
          chargesEnabled: false,
          paymentMethods: [],
        },
      });

      return {
        id: updatedStore.id,
        storeId: updatedStore.id,
        stripeAccountId: account.id,
        stripeAccountStatus: 'PENDING',
        payoutsEnabled: false,
        chargesEnabled: false,
        paymentMethods: [],
        onboardingUrl: accountLink.url,
      };
    } catch (error) {
      console.error('Erro ao criar conta Stripe Connect:', error);
      throw new Error('Erro ao criar conta no Stripe');
    }
  }

  // Buscar informações da conta conectada
  async getConnectedAccount(storeId: string): Promise<ConnectedAccountInfo | null> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || !store.stripeAccountId) {
      return null;
    }

    try {
      // Buscar informações no Stripe
      const account = await stripe.accounts.retrieve(store.stripeAccountId);

      // Atualizar status no banco se necessário
      const newStatus = this.getAccountStatus(account);
      const payoutsEnabled = account.payouts_enabled || false;
      const chargesEnabled = account.charges_enabled || false;

      if (
        store.stripeAccountStatus !== newStatus ||
        store.payoutsEnabled !== payoutsEnabled ||
        store.chargesEnabled !== chargesEnabled
      ) {
        await prisma.store.update({
          where: { id: storeId },
          data: {
            stripeAccountStatus: newStatus,
            payoutsEnabled,
            chargesEnabled,
          },
        });
      }

      return {
        id: store.id,
        storeId: store.id,
        stripeAccountId: store.stripeAccountId,
        stripeAccountStatus: newStatus,
        payoutsEnabled,
        chargesEnabled,
        paymentMethods: (store.paymentMethods as string[]) || [],
      };
    } catch (error) {
      console.error('Erro ao buscar conta Stripe Connect:', error);
      throw new Error('Erro ao buscar informações da conta');
    }
  }

  // Criar novo link de onboarding
  async createOnboardingLink(storeId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || !store.stripeAccountId) {
      throw new Error('Conta Stripe Connect não encontrada');
    }

    try {
      const accountLink = await stripe.accountLinks.create({
        account: store.stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      console.error('Erro ao criar link de onboarding:', error);
      throw new Error('Erro ao criar link de onboarding');
    }
  }

  // Criar link para dashboard da conta
  async createDashboardLink(storeId: string): Promise<string> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || !store.stripeAccountId) {
      throw new Error('Conta Stripe Connect não encontrada');
    }

    if (!store.chargesEnabled) {
      throw new Error('Conta ainda não está ativa para receber pagamentos');
    }

    try {
      const loginLink = await stripe.accounts.createLoginLink(store.stripeAccountId);
      return loginLink.url;
    } catch (error) {
      console.error('Erro ao criar link do dashboard:', error);
      throw new Error('Erro ao criar link do dashboard');
    }
  }

  // Criar Payment Intent com transferência
  async createPaymentIntentWithTransfer(data: PaymentIntentWithTransferDto): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    transferAmount: number;
    platformFeeAmount: number;
  }> {
    const { 
      amount, 
      currency, 
      storeId, 
      orderId, 
      customerEmail, 
      description, 
      platformFeePercent = 5,
      metadata = {} 
    } = data;

    // Buscar loja
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || !store.stripeAccountId) {
      throw new Error('Conta Stripe Connect não encontrada');
    }

    if (!store.chargesEnabled) {
      throw new Error('Loja não está habilitada para receber pagamentos');
    }

    // Calcular taxas
    const platformFeeAmount = Math.round(amount * (platformFeePercent / 100));
    const transferAmount = amount - platformFeeAmount;

    try {
      // Criar Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: store.stripeAccountId,
        },
        receipt_email: customerEmail,
        description,
        metadata: {
          storeId,
          orderId,
          platformFeeAmount: platformFeeAmount.toString(),
          transferAmount: transferAmount.toString(),
          ...metadata,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        transferAmount,
        platformFeeAmount,
      };
    } catch (error) {
      console.error('Erro ao criar Payment Intent:', error);
      throw new Error('Erro ao processar pagamento');
    }
  }

  // Processar webhook de conta atualizada
  async handleAccountUpdated(accountId: string): Promise<void> {
    try {
      // Buscar loja pelo accountId
      const store = await prisma.store.findFirst({
        where: { stripeAccountId: accountId },
      });

      if (!store) {
        console.log(`Loja não encontrada para account ID: ${accountId}`);
        return;
      }

      // Buscar informações atualizadas da conta
      const account = await stripe.accounts.retrieve(accountId);

      // Atualizar status no banco
      await prisma.store.update({
        where: { id: store.id },
        data: {
          stripeAccountStatus: this.getAccountStatus(account),
          payoutsEnabled: account.payouts_enabled || false,
          chargesEnabled: account.charges_enabled || false,
        },
      });

      console.log(`Conta atualizada para loja ${store.id}: ${this.getAccountStatus(account)}`);
    } catch (error) {
      console.error('Erro ao processar webhook de conta atualizada:', error);
    }
  }

  // Processar webhook de transferência criada
  async handleTransferCreated(transferId: string): Promise<void> {
    try {
      const transfer = await stripe.transfers.retrieve(transferId);
      
      // Buscar pedido pelo metadata
      const orderId = transfer.metadata?.orderId;
      if (!orderId) {
        console.log('Order ID não encontrado no metadata da transferência');
        return;
      }

      // Atualizar pedido com informações da transferência
      await prisma.order.update({
        where: { id: orderId },
        data: {
          stripeTransferId: transferId,
          platformFeeAmount: parseInt(transfer.metadata?.platformFeeAmount || '0'),
          storeAmount: transfer.amount,
        },
      });

      console.log(`Transferência ${transferId} processada para pedido ${orderId}`);
    } catch (error) {
      console.error('Erro ao processar webhook de transferência:', error);
    }
  }

  // Processar webhook de payout pago
  async handlePayoutPaid(payoutId: string): Promise<void> {
    try {
      const payout = await stripe.payouts.retrieve(payoutId);
      
      // Buscar loja pelo account ID
      const store = await prisma.store.findFirst({
        where: { stripeAccountId: payout.destination as string },
      });

      if (!store) {
        console.log(`Loja não encontrada para payout ${payoutId}`);
        return;
      }

      // Criar registro de payout
      await prisma.storePayout.create({
        data: {
          storeId: store.id,
          stripePayoutId: payoutId,
          amount: payout.amount / 100, // Convert from cents
          platformFee: 0, // Will be calculated based on orders
          netAmount: payout.amount / 100,
          status: 'PAID',
          periodStart: new Date(payout.arrival_date * 1000),
          periodEnd: new Date(payout.arrival_date * 1000),
          ordersCount: 0, // Will be updated based on actual orders
          description: payout.description || 'Payout automático',
        },
      });

      console.log(`Payout ${payoutId} registrado para loja ${store.id}`);
    } catch (error) {
      console.error('Erro ao processar webhook de payout:', error);
    }
  }

  // Buscar payouts da loja
  async getStorePayouts(storeId: string, page: number = 1, limit: number = 10): Promise<{
    payouts: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      prisma.storePayout.findMany({
        where: { storeId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.storePayout.count({
        where: { storeId },
      }),
    ]);

    return {
      payouts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Obter estatísticas financeiras da loja
  async getStoreFinancialStats(storeId: string, startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    platformFees: number;
    storeEarnings: number;
    totalOrders: number;
    averageOrderValue: number;
    payoutsReceived: number;
  }> {
    const whereClause: any = { storeId };
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [orderStats, payoutStats] = await Promise.all([
      prisma.order.aggregate({
        where: {
          ...whereClause,
          status: 'ENTREGUE',
        },
        _sum: {
          totalPrice: true,
          platformFeeAmount: true,
          storeAmount: true,
        },
        _count: true,
        _avg: {
          totalPrice: true,
        },
      }),
      prisma.storePayout.aggregate({
        where: {
          storeId,
          status: 'PAID',
          ...(startDate && endDate ? {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          } : {}),
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalRevenue: orderStats._sum.totalPrice || 0,
      platformFees: orderStats._sum.platformFeeAmount || 0,
      storeEarnings: orderStats._sum.storeAmount || 0,
      totalOrders: orderStats._count,
      averageOrderValue: orderStats._avg?.totalPrice || 0,
      payoutsReceived: payoutStats._sum.amount || 0,
    };
  }

  // Determinar status da conta baseado nas informações do Stripe
  private getAccountStatus(account: Stripe.Account): string {
    if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
      return 'ACTIVE';
    } else if (account.details_submitted) {
      return 'RESTRICTED';
    } else {
      return 'PENDING';
    }
  }

  // Validar se a loja pode receber pagamentos
  async canReceivePayments(storeId: string): Promise<boolean> {
    const accountInfo = await this.getConnectedAccount(storeId);
    return accountInfo?.chargesEnabled || false;
  }

  // Validar se a loja pode receber payouts
  async canReceivePayouts(storeId: string): Promise<boolean> {
    const accountInfo = await this.getConnectedAccount(storeId);
    return accountInfo?.payoutsEnabled || false;
  }
}
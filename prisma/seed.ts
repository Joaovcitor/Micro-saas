import { PrismaClient, PlanType, PlanInterval } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar planos de assinatura
  const plans = [
    {
      name: 'Gratuito',
      description: 'Plano básico para começar',
      type: PlanType.FREE,
      interval: PlanInterval.MONTHLY,
      price: 0,
      stripePriceId: null,
      stripeProductId: null,
      features: {
        maxProducts: 10,
        maxOrders: 50,
        maxStorage: 100, // MB
        customDomain: false,
        premiumThemes: false,
        analytics: false,
        prioritySupport: false,
      },
      isActive: true,
    },
    {
      name: 'Básico',
      description: 'Ideal para pequenos negócios',
      type: PlanType.BASIC,
      interval: PlanInterval.MONTHLY,
      price: 2900, // R$ 29,00
      stripePriceId: 'price_basic_monthly', // Substituir pelo ID real do Stripe
      stripeProductId: 'prod_basic', // Substituir pelo ID real do Stripe
      features: {
        maxProducts: 100,
        maxOrders: 500,
        maxStorage: 1000, // 1GB
        customDomain: false,
        premiumThemes: true,
        analytics: true,
        prioritySupport: false,
      },
      isActive: true,
    },
    {
      name: 'Pro',
      description: 'Para negócios em crescimento',
      type: PlanType.PRO,
      interval: PlanInterval.MONTHLY,
      price: 5900, // R$ 59,00
      stripePriceId: 'price_pro_monthly', // Substituir pelo ID real do Stripe
      stripeProductId: 'prod_pro', // Substituir pelo ID real do Stripe
      features: {
        maxProducts: 500,
        maxOrders: 2000,
        maxStorage: 5000, // 5GB
        customDomain: true,
        premiumThemes: true,
        analytics: true,
        prioritySupport: true,
      },
      isActive: true,
    },
    {
      name: 'Enterprise',
      description: 'Para grandes empresas',
      type: PlanType.ENTERPRISE,
      interval: PlanInterval.MONTHLY,
      price: 9900, // R$ 99,00
      stripePriceId: 'price_enterprise_monthly', // Substituir pelo ID real do Stripe
      stripeProductId: 'prod_enterprise', // Substituir pelo ID real do Stripe
      features: {
        maxProducts: -1, // Ilimitado
        maxOrders: -1, // Ilimitado
        maxStorage: -1, // Ilimitado
        customDomain: true,
        premiumThemes: true,
        analytics: true,
        prioritySupport: true,
      },
      isActive: true,
    },
  ];

  // Criar planos anuais (com desconto)
  const yearlyPlans = [
    {
      name: 'Básico Anual',
      description: 'Plano básico com desconto anual',
      type: PlanType.BASIC,
      interval: PlanInterval.YEARLY,
      price: 29000, // R$ 290,00 (10 meses pelo preço de 12)
      stripePriceId: 'price_basic_yearly',
      stripeProductId: 'prod_basic',
      features: {
        maxProducts: 100,
        maxOrders: 500,
        maxStorage: 1000,
        customDomain: false,
        premiumThemes: true,
        analytics: true,
        prioritySupport: false,
      },
      isActive: true,
    },
    {
      name: 'Pro Anual',
      description: 'Plano pro com desconto anual',
      type: PlanType.PRO,
      interval: PlanInterval.YEARLY,
      price: 59000, // R$ 590,00 (10 meses pelo preço de 12)
      stripePriceId: 'price_pro_yearly',
      stripeProductId: 'prod_pro',
      features: {
        maxProducts: 500,
        maxOrders: 2000,
        maxStorage: 5000,
        customDomain: true,
        premiumThemes: true,
        analytics: true,
        prioritySupport: true,
      },
      isActive: true,
    },
    {
      name: 'Enterprise Anual',
      description: 'Plano enterprise com desconto anual',
      type: PlanType.ENTERPRISE,
      interval: PlanInterval.YEARLY,
      price: 99000, // R$ 990,00 (10 meses pelo preço de 12)
      stripePriceId: 'price_enterprise_yearly',
      stripeProductId: 'prod_enterprise',
      features: {
        maxProducts: -1,
        maxOrders: -1,
        maxStorage: -1,
        customDomain: true,
        premiumThemes: true,
        analytics: true,
        prioritySupport: true,
      },
      isActive: true,
    },
  ];

  // Inserir todos os planos
  const allPlans = [...plans, ...yearlyPlans];
  
  for (const planData of allPlans) {
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        name: planData.name,
        type: planData.type,
        interval: planData.interval,
      },
    });

    if (!existingPlan) {
      await prisma.subscriptionPlan.create({
        data: planData,
      });
      console.log(`✅ Plano "${planData.name}" criado com sucesso`);
    } else {
      console.log(`⚠️  Plano "${planData.name}" já existe, pulando...`);
    }
  }

  // Criar temas padrão para as lojas
  const themes = [
    {
      name: 'Clássico',
      description: 'Tema clássico e elegante',
      isPremium: false,
      config: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Inter',
        layout: 'classic',
      },
      isActive: true,
    },
    {
      name: 'Moderno',
      description: 'Design moderno e minimalista',
      isPremium: false,
      config: {
        primaryColor: '#10B981',
        secondaryColor: '#374151',
        backgroundColor: '#F9FAFB',
        textColor: '#111827',
        fontFamily: 'Poppins',
        layout: 'modern',
      },
      isActive: true,
    },
    {
      name: 'Premium Dark',
      description: 'Tema escuro premium',
      isPremium: true,
      config: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#A78BFA',
        backgroundColor: '#111827',
        textColor: '#F9FAFB',
        fontFamily: 'Roboto',
        layout: 'premium',
      },
      isActive: true,
    },
    {
      name: 'Premium Light',
      description: 'Tema claro premium',
      isPremium: true,
      config: {
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706',
        backgroundColor: '#FFFBEB',
        textColor: '#92400E',
        fontFamily: 'Montserrat',
        layout: 'premium',
      },
      isActive: true,
    },
  ];

  for (const themeData of themes) {
    const existingTheme = await prisma.storeTheme.findFirst({
      where: { name: themeData.name },
    });

    if (!existingTheme) {
      await prisma.storeTheme.create({
        data: themeData,
      });
      console.log(`✅ Tema "${themeData.name}" criado com sucesso`);
    } else {
      console.log(`⚠️  Tema "${themeData.name}" já existe, pulando...`);
    }
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
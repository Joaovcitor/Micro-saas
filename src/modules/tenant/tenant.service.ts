import { PrismaClient, Store, User } from '@prisma/client';
import { TenantInfo } from './tenant.middleware';

const prisma = new PrismaClient();

export interface CreateTenantDto {
  name: string;
  subdomain: string;
  ownerId: string;
  planId?: string;
}

export interface UpdateTenantDto {
  name?: string;
  subdomain?: string;
  customDomain?: string;
  isActive?: boolean;
}

export interface TenantWithDetails extends Store {
  owner: User;
  subscription?: {
    id: string;
    status: string;
    plan: {
      name: string;
      type: string;
      features: any;
    };
  };
  _count: {
    products: number;
    orders: number;
  };
}

export class TenantService {
  // Criar novo tenant (loja)
  async createTenant(data: CreateTenantDto): Promise<TenantWithDetails> {
    const { name, subdomain, ownerId, planId } = data;

    // Verificar se o subdomínio já existe
    const existingStore = await prisma.store.findUnique({
      where: { subdomain },
    });

    if (existingStore) {
      throw new Error('Subdomínio já está em uso');
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o usuário já tem uma loja
    const existingUserStore = await prisma.store.findFirst({
      where: { ownerId },
    });

    if (existingUserStore) {
      throw new Error('Usuário já possui uma loja');
    }

    // Criar loja
    const store = await prisma.store.create({
      data: {
        name,
        subdomain,
        ownerId,
        isActive: true,
        setupCompleted: false,
      },
      include: {
        owner: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    // Se um plano foi especificado, criar assinatura
    if (planId) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (plan) {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

        await prisma.subscription.create({
          data: {
            storeId: store.id,
            planId: plan.id,
            status: plan.type === 'BASIC' ? 'ACTIVE' : 'INCOMPLETE',
            currentPeriodStart: now,
            currentPeriodEnd: nextMonth,
            cancelAtPeriodEnd: false,
          },
        });

        // Criar uso inicial
        await prisma.planUsage.create({
          data: {
            storeId: store.id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            productsCount: 0,
            ordersCount: 0,
            storageUsed: 0,
          },
        });
      }
    }

    return store as TenantWithDetails;
  }

  // Buscar tenant por ID
  async getTenantById(tenantId: string): Promise<TenantWithDetails | null> {
    const store = await prisma.store.findUnique({
      where: { id: tenantId },
      include: {
        owner: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return store as TenantWithDetails | null;
  }

  // Buscar tenant por subdomínio
  async getTenantBySubdomain(subdomain: string): Promise<TenantWithDetails | null> {
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        owner: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return store as TenantWithDetails | null;
  }

  // Buscar tenant por domínio customizado
  async getTenantByCustomDomain(domain: string): Promise<TenantWithDetails | null> {
    const store = await prisma.store.findFirst({
      where: { customDomain: domain },
      include: {
        owner: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return store as TenantWithDetails | null;
  }

  // Atualizar tenant
  async updateTenant(tenantId: string, data: UpdateTenantDto): Promise<TenantWithDetails> {
    const { subdomain, customDomain, ...updateData } = data;

    // Verificar se o novo subdomínio já existe (se fornecido)
    if (subdomain) {
      const existingStore = await prisma.store.findFirst({
        where: {
          subdomain,
          id: { not: tenantId },
        },
      });

      if (existingStore) {
        throw new Error('Subdomínio já está em uso');
      }
    }

    // Verificar se o domínio customizado já existe (se fornecido)
    if (customDomain) {
      const existingStore = await prisma.store.findFirst({
        where: {
          customDomain,
          id: { not: tenantId },
        },
      });

      if (existingStore) {
        throw new Error('Domínio customizado já está em uso');
      }
    }

    const store = await prisma.store.update({
      where: { id: tenantId },
      data: {
        ...updateData,
        subdomain,
        customDomain,
      },
      include: {
        owner: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return store as TenantWithDetails;
  }

  // Ativar/Desativar tenant
  async toggleTenantStatus(tenantId: string, isActive: boolean): Promise<TenantWithDetails> {
    const store = await prisma.store.update({
      where: { id: tenantId },
      data: { isActive },
      include: {
        owner: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return store as TenantWithDetails;
  }

  // Completar setup do tenant
  async completeSetup(tenantId: string): Promise<TenantWithDetails> {
    const store = await prisma.store.update({
      where: { id: tenantId },
      data: { setupCompleted: true },
      include: {
        owner: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return store as TenantWithDetails;
  }

  // Listar todos os tenants (admin)
  async getAllTenants(options: { page?: number; limit?: number; search?: string } = {}): Promise<{
    tenants: TenantWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      prisma.store.findMany({
        include: {
          owner: true,
          subscription: {
            include: {
              plan: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.store.count(),
    ]);

    return {
      tenants: tenants as TenantWithDetails[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Buscar tenants por status de assinatura
  async getTenantsBySubscriptionStatus(status: string): Promise<TenantWithDetails[]> {
    const tenants = await prisma.store.findMany({
      where: {
        subscription: {
          status: status as any,
        },
      },
      include: {
        owner: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return tenants as TenantWithDetails[];
  }

  // Verificar disponibilidade de subdomínio
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const existingStore = await prisma.store.findUnique({
      where: { subdomain },
    });

    return !existingStore;
  }

  // Verificar disponibilidade de domínio customizado
  async checkCustomDomainAvailability(domain: string): Promise<boolean> {
    const existingStore = await prisma.store.findFirst({
      where: { customDomain: domain },
    });

    return !existingStore;
  }

  // Obter estatísticas do tenant
  async getTenantStats(tenantId: string): Promise<{
    products: number;
    orders: number;
    revenue: number;
    customers: number;
    storageUsed: number;
  }> {
    const [products, orders, revenue, customers, photos] = await Promise.all([
      prisma.product.count({
        where: { storeId: tenantId },
      }),
      prisma.order.count({
        where: { storeId: tenantId },
      }),
      prisma.order.aggregate({
        where: { 
          storeId: tenantId,
          status: 'ENTREGUE',
        },
        _sum: { totalPrice: true },
      }),
      prisma.user.findMany({
        where: { 
          orders: {
            some: {
              storeId: tenantId
            }
          }
        },
        select: { id: true }
      }),
      prisma.photo.count({
        where: {
          product: {
            storeId: tenantId,
          },
        },
      }),
    ]);

    return {
      products,
      orders,
      revenue: revenue._sum?.totalPrice || 0,
      customers: customers.length,
      storageUsed: photos * 0.5, // Assumindo 500KB por foto
    };
  }

  // Deletar tenant (soft delete)
  async deleteTenant(tenantId: string): Promise<void> {
    await prisma.store.update({
      where: { id: tenantId },
      data: { 
        isActive: false,
        subdomain: `deleted_${tenantId}_${Date.now()}`,
      },
    });
  }

  // Converter TenantInfo para formato simplificado
  static toTenantInfo(store: TenantWithDetails): TenantInfo {
    return {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain || undefined,
      isActive: store.isActive,
      subscription: store.subscription ? {
        id: store.subscription.id,
        status: store.subscription.status,
        plan: {
          type: store.subscription.plan.type,
          features: store.subscription.plan.features,
        },
      } : undefined,
    };
  }
}
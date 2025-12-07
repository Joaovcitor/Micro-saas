import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Estender o tipo Request para incluir tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        subdomain: string;
        customDomain?: string;
        isActive: boolean;
        subscription?: {
          id: string;
          status: string;
          plan: {
            type: string;
            features: any;
          };
        };
      };
    }
  }
}

export interface TenantInfo {
  id: string;
  name: string;
  subdomain: string | null;
  customDomain?: string;
  isActive: boolean;
  subscription?: {
    id: string;
    status: string;
    plan: {
      type: string;
      features: any;
    };
  };
}

export class TenantMiddleware {
  // Middleware principal de identificação de tenant
  static async identify(req: Request, res: Response, next: NextFunction) {
    try {
      let tenantIdentifier: string | null = null;

      // 1. Tentar identificar por custom domain
      const host = req.get('host');
      if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        // Remover porta se existir
        const domain = host.split(':')[0];
        
        // Verificar se é um custom domain
        const storeByDomain = await prisma.store.findFirst({
          where: { customDomain: domain },
          include: {
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        });

        if (storeByDomain) {
          req.tenant = {
            id: storeByDomain.id,
            name: storeByDomain.name,
            subdomain: storeByDomain.subdomain || '',
            customDomain: storeByDomain.customDomain || undefined,
            isActive: storeByDomain.isActive,
            subscription: storeByDomain.subscription ? {
              id: storeByDomain.subscription.id,
              status: storeByDomain.subscription.status,
              plan: {
                type: storeByDomain.subscription.plan.type,
                features: storeByDomain.subscription.plan.features,
              },
            } : undefined,
          };
          return next();
        }
      }

      // 2. Tentar identificar por subdomínio
      if (host) {
        const subdomain = TenantMiddleware.extractSubdomain(host);
        if (subdomain) {
          tenantIdentifier = subdomain;
        }
      }

      // 3. Tentar identificar por header X-Tenant-ID
      if (!tenantIdentifier) {
        tenantIdentifier = req.get('X-Tenant-ID') || null;
      }

      // 4. Tentar identificar por query parameter (para desenvolvimento)
      if (!tenantIdentifier && process.env.NODE_ENV === 'development') {
        tenantIdentifier = req.query.tenant as string;
      }

      if (!tenantIdentifier) {
        return res.status(400).json({
          success: false,
          message: 'Tenant não identificado',
          code: 'TENANT_NOT_FOUND',
        });
      }

      // Buscar loja no banco de dados
      const store = await prisma.store.findFirst({
        where: {
          OR: [
            { subdomain: tenantIdentifier },
            { id: tenantIdentifier },
          ],
        },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Loja não encontrada',
          code: 'STORE_NOT_FOUND',
        });
      }

      // Verificar se a loja está ativa
      if (!store.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Loja desativada',
          code: 'STORE_INACTIVE',
        });
      }

      // Adicionar informações do tenant ao request
      req.tenant = {
        id: store.id,
        name: store.name,
        subdomain: store.subdomain || '',
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

      next();
    } catch (error) {
      console.error('Erro no middleware de tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  // Middleware para validar se o tenant tem assinatura ativa
  static requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
    if (!req.tenant) {
      return res.status(400).json({
        success: false,
        message: 'Tenant não identificado',
        code: 'TENANT_NOT_FOUND',
      });
    }

    if (!req.tenant.subscription) {
      return res.status(403).json({
        success: false,
        message: 'Assinatura não encontrada',
        code: 'SUBSCRIPTION_NOT_FOUND',
      });
    }

    const validStatuses = ['ACTIVE', 'TRIALING'];
    if (!validStatuses.includes(req.tenant.subscription.status)) {
      return res.status(403).json({
        success: false,
        message: 'Assinatura inativa',
        code: 'SUBSCRIPTION_INACTIVE',
        data: {
          status: req.tenant.subscription.status,
        },
      });
    }

    next();
  }

  // Middleware para validar funcionalidades premium
  static requirePremiumFeature(feature: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.tenant?.subscription) {
        return res.status(403).json({
          success: false,
          message: 'Assinatura necessária para esta funcionalidade',
          code: 'SUBSCRIPTION_REQUIRED',
        });
      }

      const features = req.tenant.subscription.plan.features as any;
      
      if (!features[feature]) {
        return res.status(403).json({
          success: false,
          message: `Funcionalidade '${feature}' não disponível no seu plano`,
          code: 'FEATURE_NOT_AVAILABLE',
          data: {
            feature,
            currentPlan: req.tenant.subscription.plan.type,
          },
        });
      }

      next();
    };
  }

  // Middleware para validar limites do plano
  static async checkPlanLimits(limitType: 'products' | 'orders' | 'storage') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.tenant?.subscription) {
          return res.status(403).json({
            success: false,
            message: 'Assinatura necessária',
            code: 'SUBSCRIPTION_REQUIRED',
          });
        }

        const features = req.tenant.subscription.plan.features as any;
        const storeId = req.tenant.id;

        let currentUsage = 0;
        let limit = 0;

        switch (limitType) {
          case 'products':
            limit = features.maxProducts;
            if (limit !== -1) {
              currentUsage = await prisma.product.count({
                where: { storeId },
              });
            }
            break;

          case 'orders':
            limit = features.maxOrders;
            if (limit !== -1) {
              // Contar pedidos do período atual
              const subscription = await prisma.subscription.findFirst({
                where: { storeId },
              });
              
              if (subscription) {
                currentUsage = await prisma.order.count({
                  where: {
                    storeId,
                    createdAt: {
                      gte: subscription.currentPeriodStart,
                      lte: subscription.currentPeriodEnd,
                    },
                  },
                });
              }
            }
            break;

          case 'storage':
            limit = features.maxStorage;
            if (limit !== -1) {
              // Calcular storage usado (simplificado)
              const photoCount = await prisma.photo.count({
                where: {
                  product: {
                    storeId,
                  },
                },
              });
              currentUsage = photoCount * 0.5; // Assumindo 500KB por foto
            }
            break;
        }

        // Se o limite é -1, significa ilimitado
        if (limit === -1) {
          return next();
        }

        if (currentUsage >= limit) {
          return res.status(403).json({
            success: false,
            message: `Limite de ${limitType} atingido`,
            code: 'PLAN_LIMIT_EXCEEDED',
            data: {
              limitType,
              currentUsage,
              limit,
              planType: req.tenant.subscription.plan.type,
            },
          });
        }

        next();
      } catch (error) {
        console.error('Erro ao verificar limites do plano:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR',
        });
      }
    };
  }

  // Extrair subdomínio do host
  private static extractSubdomain(host: string): string | null {
    // Remover porta se existir
    const domain = host.split(':')[0];
    
    // Lista de domínios base (configurar conforme necessário)
    const baseDomains = [
      'localhost',
      '127.0.0.1',
      process.env.BASE_DOMAIN || 'yourdomain.com',
    ];

    // Verificar se é um dos domínios base
    if (baseDomains.includes(domain)) {
      return null;
    }

    // Extrair subdomínio
    const parts = domain.split('.');
    
    // Se tem pelo menos 3 partes (subdomain.domain.com)
    if (parts.length >= 3) {
      return parts[0];
    }

    return null;
  }

  // Middleware para desenvolvimento - permite bypass do tenant
  static developmentBypass(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'development' && req.query.bypassTenant === 'true') {
      return next();
    }
    
    return TenantMiddleware.identify(req, res, next);
  }
}

// Exports principais
export const identifyTenant = TenantMiddleware.identify;
export const requireActiveSubscription = TenantMiddleware.requireActiveSubscription;
export const requirePremiumFeature = TenantMiddleware.requirePremiumFeature;
export const checkPlanLimits = TenantMiddleware.checkPlanLimits;
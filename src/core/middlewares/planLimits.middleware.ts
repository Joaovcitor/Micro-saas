import { Request, Response, NextFunction } from 'express';
import prisma from '../../prisma/client';
import { PlanType } from '@prisma/client';

// Interface para definir os limites de cada plano
interface PlanLimits {
  maxProducts: number;
  maxOrders: number;
  maxStorageGB: number;
  hasCustomDomain: boolean;
  hasAdvancedAnalytics: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
}

// Configuração dos limites por tipo de plano
const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  BASIC: {
    maxProducts: 100,
    maxOrders: 500,
    maxStorageGB: 5,
    hasCustomDomain: true,
    hasAdvancedAnalytics: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
  },
  PREMIUM: {
    maxProducts: 1000,
    maxOrders: 5000,
    maxStorageGB: 20,
    hasCustomDomain: true,
    hasAdvancedAnalytics: true,
    hasApiAccess: true,
    hasPrioritySupport: true,
  },
};

// Middleware para verificar limites de produtos
export const checkProductLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const storeId = req.user?.storeId;
    const planType = req.user?.planType as PlanType;

    if (!storeId || !planType) {
      return res.status(401).json({ error: 'Informações de loja não encontradas' });
    }

    const limits = PLAN_LIMITS[planType];
    
    // Se o plano permite produtos ilimitados
    if (limits.maxProducts === -1) {
      return next();
    }

    // Contar produtos atuais da loja
    const currentProductCount = await prisma.product.count({
      where: { storeId },
    });

    if (currentProductCount >= limits.maxProducts) {
      return res.status(403).json({
        error: 'Limite de produtos atingido',
        current: currentProductCount,
        limit: limits.maxProducts,
        planType,
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar limites de pedidos
export const checkOrderLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const storeId = req.user?.storeId;
    const planType = req.user?.planType as PlanType;

    if (!storeId || !planType) {
      return res.status(401).json({ error: 'Informações de loja não encontradas' });
    }

    const limits = PLAN_LIMITS[planType];
    
    // Se o plano permite pedidos ilimitados
    if (limits.maxOrders === -1) {
      return next();
    }

    // Contar pedidos do mês atual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentOrderCount = await prisma.order.count({
      where: {
        storeId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    if (currentOrderCount >= limits.maxOrders) {
      return res.status(403).json({
        error: 'Limite mensal de pedidos atingido',
        current: currentOrderCount,
        limit: limits.maxOrders,
        planType,
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar limites de armazenamento
export const checkStorageLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const storeId = req.user?.storeId;
    const planType = req.user?.planType as PlanType;

    if (!storeId || !planType) {
      return res.status(401).json({ error: 'Informações de loja não encontradas' });
    }

    const limits = PLAN_LIMITS[planType];
    
    // Calcular uso atual de armazenamento (em bytes)
    // Aqui você implementaria a lógica para calcular o uso real de armazenamento
    // Por exemplo, somando o tamanho de todas as imagens de produtos
    const currentStorageBytes = await calculateCurrentStorageUsage(storeId);
    const currentStorageGB = currentStorageBytes / (1024 * 1024 * 1024);

    if (currentStorageGB >= limits.maxStorageGB) {
      return res.status(403).json({
        error: 'Limite de armazenamento atingido',
        current: `${currentStorageGB.toFixed(2)} GB`,
        limit: `${limits.maxStorageGB} GB`,
        planType,
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de armazenamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar recursos premium
export const requireCustomDomain = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const planType = req.user?.planType as PlanType;

  if (!planType) {
    return res.status(401).json({ error: 'Informações de plano não encontradas' });
  }

  const limits = PLAN_LIMITS[planType];

  if (!limits.hasCustomDomain) {
    return res.status(403).json({
      error: 'Recurso disponível apenas em planos pagos',
      feature: 'Domínio personalizado',
      planType,
    });
  }

  next();
};

export const requireAdvancedAnalytics = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const planType = req.user?.planType as PlanType;

  if (!planType) {
    return res.status(401).json({ error: 'Informações de plano não encontradas' });
  }

  const limits = PLAN_LIMITS[planType];

  if (!limits.hasAdvancedAnalytics) {
    return res.status(403).json({
      error: 'Recurso disponível apenas nos planos Pro e Enterprise',
      feature: 'Analytics avançado',
      planType,
    });
  }

  next();
};

export const requireApiAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const planType = req.user?.planType as PlanType;

  if (!planType) {
    return res.status(401).json({ error: 'Informações de plano não encontradas' });
  }

  const limits = PLAN_LIMITS[planType];

  if (!limits.hasApiAccess) {
    return res.status(403).json({
      error: 'Acesso à API disponível apenas nos planos Pro e Enterprise',
      feature: 'API Access',
      planType,
    });
  }

  next();
};

// Função auxiliar para calcular uso de armazenamento
async function calculateCurrentStorageUsage(storeId: string): Promise<number> {
  // Implementação simplificada - você pode expandir para incluir:
  // - Tamanho de imagens de produtos
  // - Arquivos de documentos
  // - Logs e outros dados
  
  try {
    // Por enquanto, retornamos um valor simulado baseado no número de produtos
    const productCount = await prisma.product.count({
      where: { storeId },
    });
    
    // Assumindo uma média de 500KB por produto (imagens, etc.)
    return productCount * 500 * 1024; // bytes
  } catch (error) {
    console.error('Erro ao calcular uso de armazenamento:', error);
    return 0;
  }
}

// Função para obter limites do plano
export const getPlanLimits = (planType: PlanType): PlanLimits => {
  return PLAN_LIMITS[planType];
};

// Função para verificar se um recurso está disponível no plano
export const hasFeature = (planType: PlanType, feature: keyof PlanLimits): boolean => {
  const limits = PLAN_LIMITS[planType];
  return Boolean(limits[feature]);
};

// Middleware genérico para verificar múltiplos limites
export const checkMultipleLimits = (checks: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const check of checks) {
        switch (check) {
          case 'products':
            await new Promise<void>((resolve, reject) => {
              checkProductLimit(req, res, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            break;
          case 'orders':
            await new Promise<void>((resolve, reject) => {
              checkOrderLimit(req, res, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            break;
          case 'storage':
            await new Promise<void>((resolve, reject) => {
              checkStorageLimit(req, res, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            break;
        }
      }
      next();
    } catch (error) {
      // O erro já foi tratado pelos middlewares individuais
    }
  };
};
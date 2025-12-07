import { Request, Response } from 'express';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
  CancelSubscriptionSchema,
  CreatePlanSchema,
  UpdatePlanSchema,
  SubscriptionFiltersSchema,
  SubscriptionCheckoutSchema,
} from './subscription.dto';

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  // GET /api/plans - Buscar todos os planos
  async getPlans(req: Request, res: Response) {
    try {
      const plans = await subscriptionService.getPlans();
      
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // GET /api/plans/:id - Buscar plano por ID
  async getPlanById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const plan = await subscriptionService.getPlanById(id);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plano não encontrado',
        });
      }

      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // POST /api/admin/plans - Criar novo plano (admin)
  async createPlan(req: Request, res: Response) {
    try {
      const validation = CreatePlanSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.issues,
        });
      }

      const plan = await subscriptionService.createPlan(validation.data);
      
      res.status(201).json({
        success: true,
        data: plan,
        message: 'Plano criado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // PUT /api/admin/plans/:id - Atualizar plano (admin)
  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validation = UpdatePlanSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.issues,
        });
      }

      const plan = await subscriptionService.updatePlan(id, validation.data);
      
      res.json({
        success: true,
        data: plan,
        message: 'Plano atualizado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // GET /api/subscription/current - Buscar assinatura atual da loja
  async getCurrentSubscription(req: Request, res: Response) {
    try {
      const { storeId } = req.user || {};
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID não encontrado',
        });
      }

      const subscription = await subscriptionService.getSubscriptionByStore(storeId);
      
      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // GET /api/admin/subscriptions - Buscar todas as assinaturas (admin)
  async getSubscriptions(req: Request, res: Response) {
    try {
      const validation = SubscriptionFiltersSchema.safeParse(req.query);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: validation.error.issues,
        });
      }

      const result = await subscriptionService.getSubscriptions(validation.data);
      
      res.json({
        success: true,
        data: result.subscriptions,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: validation.data.limit,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // POST /api/subscription/checkout - Criar checkout de assinatura
  async createCheckout(req: Request, res: Response) {
    try {
      const { storeId } = req.user || {};
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID não encontrado',
        });
      }

      const validation = SubscriptionCheckoutSchema.safeParse({
        ...req.body,
        storeId,
      });
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.issues,
        });
      }

      const checkout = await subscriptionService.createSubscriptionCheckout(validation.data);
      
      res.json({
        success: true,
        data: checkout,
        message: 'Checkout criado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // PUT /api/subscription/:id - Atualizar assinatura
  async updateSubscription(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validation = UpdateSubscriptionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.issues,
        });
      }

      const subscription = await subscriptionService.updateSubscription(id, validation.data);
      
      res.json({
        success: true,
        data: subscription,
        message: 'Assinatura atualizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // POST /api/subscription/cancel - Cancelar assinatura
  async cancelSubscription(req: Request, res: Response) {
    try {
      const { storeId } = req.user || {};
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID não encontrado',
        });
      }

      const validation = CancelSubscriptionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: validation.error.issues,
        });
      }

      const subscription = await subscriptionService.cancelSubscription(storeId, validation.data);
      
      res.json({
        success: true,
        data: subscription,
        message: 'Assinatura cancelada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // GET /api/subscription/usage - Buscar estatísticas de uso
  async getUsageStats(req: Request, res: Response) {
    try {
      const { storeId } = req.user || {};
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID não encontrado',
        });
      }

      const stats = await subscriptionService.getUsageStats(storeId);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // GET /api/subscription/limits/products - Verificar se pode criar produto
  async checkProductLimit(req: Request, res: Response) {
    try {
      const { storeId } = req.user || {};
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID não encontrado',
        });
      }

      const canCreate = await subscriptionService.canCreateProduct(storeId);
      
      res.json({
        success: true,
        data: { canCreate },
      });
    } catch (error) {
      console.error('Erro ao verificar limite de produtos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // GET /api/subscription/limits/orders - Verificar se pode criar pedido
  async checkOrderLimit(req: Request, res: Response) {
    try {
      const { storeId } = req.user || {};
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID não encontrado',
        });
      }

      const canCreate = await subscriptionService.canCreateOrder(storeId);
      
      res.json({
        success: true,
        data: { canCreate },
      });
    } catch (error) {
      console.error('Erro ao verificar limite de pedidos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // POST /api/subscription/limits/storage - Verificar se pode usar storage
  async checkStorageLimit(req: Request, res: Response) {
    try {
      const { storeId } = req.user || {};
      const { additionalMB } = req.body;
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID não encontrado',
        });
      }

      if (!additionalMB || typeof additionalMB !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'additionalMB é obrigatório e deve ser um número',
        });
      }

      const canUse = await subscriptionService.canUseStorage(storeId, additionalMB);
      
      res.json({
        success: true,
        data: { canUse },
      });
    } catch (error) {
      console.error('Erro ao verificar limite de storage:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
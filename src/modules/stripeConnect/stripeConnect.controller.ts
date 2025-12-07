import { Request, Response } from 'express';
import { StripeConnectService } from './stripeConnect.service';
import {
  CreateConnectedAccountSchema,
  CreateOnboardingLinkSchema,
  CreatePaymentIntentWithTransferSchema,
  GetStorePayoutsSchema,
  GetFinancialStatsSchema,
  StoreIdParamSchema,
  PaginationQuerySchema,
  DateRangeQuerySchema,
} from './stripeConnect.dto';

export class StripeConnectController {
  private stripeConnectService: StripeConnectService;

  constructor() {
    this.stripeConnectService = new StripeConnectService();
  }

  // Criar conta conectada
  createConnectedAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateConnectedAccountSchema.parse(req.body);
      
      const result = await this.stripeConnectService.createConnectedAccount(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Conta Stripe Connect criada com sucesso',
        data: result,
      });
    } catch (error: any) {
      console.error('Erro ao criar conta conectada:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar conta conectada',
      });
    }
  };

  // Buscar informações da conta conectada
  getConnectedAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { storeId } = StoreIdParamSchema.parse(req.params);
      
      const result = await this.stripeConnectService.getConnectedAccount(storeId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Conta conectada não encontrada',
        });
        return;
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Erro ao buscar conta conectada:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar conta conectada',
      });
    }
  };

  // Criar link de onboarding
  createOnboardingLink = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreateOnboardingLinkSchema.parse(req.body);
      
      const onboardingUrl = await this.stripeConnectService.createOnboardingLink(
        validatedData.storeId,
        validatedData.refreshUrl,
        validatedData.returnUrl
      );
      
      res.json({
        success: true,
        message: 'Link de onboarding criado com sucesso',
        data: { onboardingUrl },
      });
    } catch (error: any) {
      console.error('Erro ao criar link de onboarding:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar link de onboarding',
      });
    }
  };

  // Criar link do dashboard
  createDashboardLink = async (req: Request, res: Response): Promise<void> => {
    try {
      const { storeId } = StoreIdParamSchema.parse(req.params);
      
      const dashboardUrl = await this.stripeConnectService.createDashboardLink(storeId);
      
      res.json({
        success: true,
        message: 'Link do dashboard criado com sucesso',
        data: { dashboardUrl },
      });
    } catch (error: any) {
      console.error('Erro ao criar link do dashboard:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar link do dashboard',
      });
    }
  };

  // Criar Payment Intent com transferência
  createPaymentIntentWithTransfer = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = CreatePaymentIntentWithTransferSchema.parse(req.body);
      
      const result = await this.stripeConnectService.createPaymentIntentWithTransfer(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Payment Intent criado com sucesso',
        data: result,
      });
    } catch (error: any) {
      console.error('Erro ao criar Payment Intent:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar Payment Intent',
      });
    }
  };

  // Buscar payouts da loja
  getStorePayouts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { storeId } = StoreIdParamSchema.parse(req.params);
      const { page, limit } = PaginationQuerySchema.parse(req.query);
      
      const result = await this.stripeConnectService.getStorePayouts(storeId, page, limit);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Erro ao buscar payouts:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar payouts',
      });
    }
  };

  // Obter estatísticas financeiras
  getFinancialStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { storeId } = StoreIdParamSchema.parse(req.params);
      const { startDate, endDate } = DateRangeQuerySchema.parse(req.query);
      
      const result = await this.stripeConnectService.getStoreFinancialStats(
        storeId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas financeiras:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar estatísticas financeiras',
      });
    }
  };

  // Verificar se pode receber pagamentos
  canReceivePayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { storeId } = StoreIdParamSchema.parse(req.params);
      
      const canReceive = await this.stripeConnectService.canReceivePayments(storeId);
      
      res.json({
        success: true,
        data: { canReceivePayments: canReceive },
      });
    } catch (error: any) {
      console.error('Erro ao verificar capacidade de receber pagamentos:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao verificar capacidade de receber pagamentos',
      });
    }
  };

  // Verificar se pode receber payouts
  canReceivePayouts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { storeId } = StoreIdParamSchema.parse(req.params);
      
      const canReceive = await this.stripeConnectService.canReceivePayouts(storeId);
      
      res.json({
        success: true,
        data: { canReceivePayouts: canReceive },
      });
    } catch (error: any) {
      console.error('Erro ao verificar capacidade de receber payouts:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao verificar capacidade de receber payouts',
      });
    }
  };

  // Webhook handlers
  handleAccountUpdated = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId } = req.body;
      
      if (!accountId) {
        res.status(400).json({
          success: false,
          message: 'Account ID é obrigatório',
        });
        return;
      }

      await this.stripeConnectService.handleAccountUpdated(accountId);
      
      res.json({
        success: true,
        message: 'Webhook processado com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao processar webhook de conta atualizada:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao processar webhook',
      });
    }
  };

  handleTransferCreated = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transferId } = req.body;
      
      if (!transferId) {
        res.status(400).json({
          success: false,
          message: 'Transfer ID é obrigatório',
        });
        return;
      }

      await this.stripeConnectService.handleTransferCreated(transferId);
      
      res.json({
        success: true,
        message: 'Webhook processado com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao processar webhook de transferência:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao processar webhook',
      });
    }
  };

  handlePayoutPaid = async (req: Request, res: Response): Promise<void> => {
    try {
      const { payoutId } = req.body;
      
      if (!payoutId) {
        res.status(400).json({
          success: false,
          message: 'Payout ID é obrigatório',
        });
        return;
      }

      await this.stripeConnectService.handlePayoutPaid(payoutId);
      
      res.json({
        success: true,
        message: 'Webhook processado com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao processar webhook de payout:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao processar webhook',
      });
    }
  };
}
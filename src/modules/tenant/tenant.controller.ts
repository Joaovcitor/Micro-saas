import { Request, Response } from 'express';
import { TenantService, CreateTenantDto, UpdateTenantDto } from './tenant.service';

export class TenantController {
  private tenantService = new TenantService();

  // Criar novo tenant
  createTenant = async (req: Request, res: Response) => {
    try {
      const data: CreateTenantDto = req.body;
      const tenant = await this.tenantService.createTenant(data);

      res.status(201).json({
        success: true,
        message: 'Tenant criado com sucesso',
        data: tenant,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar tenant',
      });
    }
  };

  // Obter tenant atual
  getCurrentTenant = async (req: Request, res: Response) => {
    try {
      if (!req.tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant não encontrado',
        });
      }

      const tenant = await this.tenantService.getTenantById(req.tenant.id);
      
      res.json({
        success: true,
        data: tenant,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar tenant',
      });
    }
  };

  // Atualizar tenant
  updateTenant = async (req: Request, res: Response) => {
    try {
      if (!req.tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant não encontrado',
        });
      }

      const data: UpdateTenantDto = req.body;
      const tenant = await this.tenantService.updateTenant(req.tenant.id, data);

      res.json({
        success: true,
        message: 'Tenant atualizado com sucesso',
        data: tenant,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar tenant',
      });
    }
  };

  // Completar setup
  completeSetup = async (req: Request, res: Response) => {
    try {
      if (!req.tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant não encontrado',
        });
      }

      const tenant = await this.tenantService.completeSetup(req.tenant.id);

      res.json({
        success: true,
        message: 'Setup completado com sucesso',
        data: tenant,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao completar setup',
      });
    }
  };

  // Obter todos os tenants (admin)
  getAllTenants = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const tenants = await this.tenantService.getAllTenants({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });

      res.json({
        success: true,
        data: tenants,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar tenants',
      });
    }
  };

  // Obter tenant por ID
  getTenantById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tenant = await this.tenantService.getTenantById(id);

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant não encontrado',
        });
      }

      res.json({
        success: true,
        data: tenant,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar tenant',
      });
    }
  };

  // Ativar/Desativar tenant
  toggleTenantStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const tenant = await this.tenantService.toggleTenantStatus(id, isActive);

      res.json({
        success: true,
        message: `Tenant ${isActive ? 'ativado' : 'desativado'} com sucesso`,
        data: tenant,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao alterar status do tenant',
      });
    }
  };

  // Deletar tenant
  deleteTenant = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.tenantService.deleteTenant(id);

      res.json({
        success: true,
        message: 'Tenant deletado com sucesso',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao deletar tenant',
      });
    }
  };
}
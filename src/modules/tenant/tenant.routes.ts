import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { authMiddleware } from '../../core/middlewares/authMiddleware';

const router = Router();
const tenantController = new TenantController();

// Rotas públicas para criação de tenant
router.post('/', tenantController.createTenant);

// Rotas protegidas
router.use(authMiddleware);

// Gerenciamento de tenant
router.get('/current', tenantController.getCurrentTenant);
router.put('/current', tenantController.updateTenant);
router.post('/complete-setup', tenantController.completeSetup);

// Rotas administrativas
router.get('/all', tenantController.getAllTenants);
router.get('/:id', tenantController.getTenantById);
router.put('/:id/status', tenantController.toggleTenantStatus);
router.delete('/:id', tenantController.deleteTenant);

export default router;
import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { authMiddleware } from '../../core/middlewares/authMiddleware';

const router = Router();
const subscriptionController = new SubscriptionController();

// Rotas públicas - Planos
router.get('/plans', subscriptionController.getPlans);
router.get('/plans/:id', subscriptionController.getPlanById);

// Rotas protegidas - Assinaturas
router.use(authMiddleware); // Aplicar middleware de autenticação para todas as rotas abaixo

// Assinatura atual da loja
router.get('/current', subscriptionController.getCurrentSubscription);

// Checkout de assinatura
router.post('/checkout', subscriptionController.createCheckout);

// Cancelar assinatura
router.post('/cancel', subscriptionController.cancelSubscription);

// Estatísticas de uso
router.get('/usage', subscriptionController.getUsageStats);

// Verificação de limites
router.get('/limits/products', subscriptionController.checkProductLimit);
router.get('/limits/orders', subscriptionController.checkOrderLimit);
router.post('/limits/storage', subscriptionController.checkStorageLimit);

// Rotas administrativas (requerem permissão de admin)
// TODO: Implementar middleware de admin
router.get('/admin/subscriptions', subscriptionController.getSubscriptions);
router.post('/admin/plans', subscriptionController.createPlan);
router.put('/admin/plans/:id', subscriptionController.updatePlan);
router.put('/admin/subscriptions/:id', subscriptionController.updateSubscription);

export default router;
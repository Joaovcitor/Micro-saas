import { Router } from 'express';
import { StripeConnectController } from './stripeConnect.controller';
import { authMiddleware } from '../../core/middlewares/authMiddleware';
import { identifyTenant } from '../tenant/tenant.middleware';

const router = Router();
const stripeConnectController = new StripeConnectController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para gerenciar contas conectadas
router.post('/accounts', stripeConnectController.createConnectedAccount);
router.get('/accounts/:storeId', stripeConnectController.getConnectedAccount);
router.post('/accounts/onboarding-link', stripeConnectController.createOnboardingLink);
router.get('/accounts/:storeId/dashboard-link', stripeConnectController.createDashboardLink);

// Rotas para pagamentos
router.post('/payment-intents', stripeConnectController.createPaymentIntentWithTransfer);

// Rotas para payouts e estatísticas
router.get('/stores/:storeId/payouts', stripeConnectController.getStorePayouts);
router.get('/stores/:storeId/financial-stats', stripeConnectController.getFinancialStats);

// Rotas para verificações
router.get('/stores/:storeId/can-receive-payments', stripeConnectController.canReceivePayments);
router.get('/stores/:storeId/can-receive-payouts', stripeConnectController.canReceivePayouts);

// Rotas de webhook (sem autenticação)
const webhookRouter = Router();
webhookRouter.post('/account-updated', stripeConnectController.handleAccountUpdated);
webhookRouter.post('/transfer-created', stripeConnectController.handleTransferCreated);
webhookRouter.post('/payout-paid', stripeConnectController.handlePayoutPaid);

export default router;
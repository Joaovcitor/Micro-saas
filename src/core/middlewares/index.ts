// Middlewares de autenticação
export { authMiddleware } from './authMiddleware';
export { identifyTenant, requireActiveSubscription } from '../../modules/tenant/tenant.middleware';

// Middlewares utilitários
export { cookieMiddleware } from './cookie.middleware';
// export { roleMiddleware } from './role.middleware'; // Commented out as the file is commented
export { upload as uploadMiddleware } from './upload.middleware';

// Middlewares de controle de limites por plano
export * from './planLimits.middleware';
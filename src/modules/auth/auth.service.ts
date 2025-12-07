import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
  verifyAccessToken,
} from "../../core/utils/jwt.utils";
import bcrypt from "bcrypt";
import prisma from "../../prisma/client";
import { TenantService } from "../tenant/tenant.service";
import { SubscriptionService } from "../subscription/subscription.service";

export class AuthService {
  static async validateUser(
    email: string,
    password: string
  ): Promise<{
    id: string;
    email: string;
    role: string;
    storeId: string;
    store?: {
      id: string;
      name: string;
      subdomain: string;
      customDomain?: string;
      subscription?: {
        id: string;
        status: string;
        plan: {
          id: string;
          name: string;
          type: string;
          interval: string;
        };
      };
    };
  } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          password: true,
          storeId: true,
          store: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              customDomain: true,
              subscription: {
                select: {
                  id: true,
                  status: true,
                  plan: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      interval: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        storeId: user.storeId ?? "",
        store: user.store ? {
          id: user.store.id,
          name: user.store.name,
          subdomain: user.store.subdomain || "",
          customDomain: user.store.customDomain || undefined,
          subscription: user.store.subscription ? {
            id: user.store.subscription.id,
            status: user.store.subscription.status as string,
            plan: {
              id: user.store.subscription.plan.id,
              name: user.store.subscription.plan.name,
              type: user.store.subscription.plan.type as string,
              interval: user.store.subscription.plan.interval as string,
            },
          } : undefined,
        } : undefined,
      };
    } catch (error) {
      console.error("Erro ao validar usuário:", error);
      return null;
    }
  }

  static async login(
    email: string,
    password: string
  ): Promise<{
    user: { 
      id: string; 
      email: string; 
      role: string; 
      storeId: string;
      store?: {
        id: string;
        name: string;
        subdomain: string;
        customDomain?: string;
        subscription?: {
          id: string;
          status: string;
          plan: {
            id: string;
            name: string;
            type: string;
            interval: string;
          };
        };
      };
    };
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    // Verificar se a loja tem assinatura ativa (se não for admin)
    if (user.role !== 'ADMIN' && user.store?.subscription) {
      const subscription = user.store.subscription;
      if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
        throw new Error("Assinatura inativa. Renove sua assinatura para continuar.");
      }
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
      tenantId: user.store?.id,
      subscriptionStatus: user.store?.subscription?.status,
      planType: user.store?.subscription?.plan?.type,
    });
    
    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      // Encontrar usuário pelo refresh token e removê-lo
      const user = await prisma.user.findFirst({
        where: { refreshToken },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
      }
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  }

  static async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; newRefreshToken?: string }> {
    try {
      // Verificar se o refresh token existe no banco
      const user = await prisma.user.findFirst({
        where: { refreshToken },
        include: {
          store: {
            include: {
              subscription: {
                include: {
                  plan: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error("Refresh token inválido");
      }

      // Verificar validade do token
      const payload = verifyRefreshToken(refreshToken);

      // Verificar se a assinatura ainda está ativa (se não for admin)
      if (user.role !== 'ADMIN' && user.store?.subscription) {
        const subscription = user.store.subscription;
        if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
          throw new Error("Assinatura inativa. Renove sua assinatura para continuar.");
        }
      }

      // Gerar novo access token com informações atualizadas
      const accessToken = signAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: user.role,
        storeId: user.storeId || '',
        tenantId: user.store?.id,
        subscriptionStatus: user.store?.subscription?.status,
        planType: user.store?.subscription?.plan.type,
      });

      // Opcional: Rotacionar refresh token (mais seguro)
      const shouldRotate = false; // Defina sua política de rotação

      if (shouldRotate) {
        const newRefreshToken = signRefreshToken({
          userId: payload.userId,
          email: payload.email,
          role: user.role,
          storeId: user.storeId || '',
        });

        // Atualizar no banco
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: newRefreshToken },
        });

        return { accessToken, newRefreshToken };
      }

      return { accessToken };
    } catch (error) {
      // Se o refresh token estiver inválido, remover do banco
      const user = await prisma.user.findFirst({
        where: { refreshToken },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
      }

      throw new Error("Refresh token expirado ou inválido");
    }
  }

  static async validateAccessToken(accessToken: string): Promise<TokenPayload> {
    try {
      const payload = verifyAccessToken(accessToken);
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        storeId: payload.storeId,
        tenantId: payload.tenantId,
        subscriptionStatus: payload.subscriptionStatus,
        planType: payload.planType,
      };
    } catch (error) {
      throw new Error("Access token inválido");
    }
  }

  // Criar usuário com tenant (para onboarding)
  static async createUserWithTenant(userData: {
    email: string;
    password: string;
    name: string;
    storeName: string;
    subdomain: string;
    planId?: string;
  }): Promise<{
    user: any;
    store: any;
    subscription?: any;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    try {
      // Verificar se o email já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error("Email já está em uso");
      }

      // Verificar se o subdomínio já existe
      const existingStore = await prisma.store.findUnique({
        where: { subdomain: userData.subdomain },
      });

      if (existingStore) {
        throw new Error("Subdomínio já está em uso");
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Criar usuário e loja em uma transação
      const result = await prisma.$transaction(async (tx) => {
        // Criar loja
        const store = await tx.store.create({
          data: {
            name: userData.storeName,
            subdomain: userData.subdomain,
            isActive: true,
            owner: {
              create: {
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                role: "OWNER",
              }
            }
          },
        });

        // Obter o usuário criado
        const user = await tx.user.findFirst({
          where: { email: userData.email },
        });

        if (!user) {
          throw new Error("Erro ao criar usuário");
        }

        // Atualizar o usuário com o storeId
        await tx.user.update({
          where: { id: user.id },
          data: { storeId: store.id },
        });

        // Criar assinatura se planId foi fornecido
        let subscription = null;
        if (userData.planId) {
          const subscriptionService = new SubscriptionService();
          subscription = await subscriptionService.createSubscription({
            storeId: store.id,
            planId: userData.planId,
            stripeSubscriptionId: '',
            stripeCustomerId: '',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'TRIALING' as any,
          });
        }

        return { user, store, subscription };
      });

      // Gerar tokens
      const accessToken = signAccessToken({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        storeId: result.store.id,
        tenantId: result.store.id,
        subscriptionStatus: result.subscription?.status,
        planType: result.subscription?.plan?.type,
      });

      const refreshToken = signRefreshToken({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        storeId: result.store.id,
      });

      // Atualizar refresh token no banco
      await prisma.user.update({
        where: { id: result.user.id },
        data: { refreshToken },
      });

      return {
        user: result.user,
        store: result.store,
        subscription: result.subscription,
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      console.error("Erro ao criar usuário com tenant:", error);
      throw error;
    }
  }

  // Validar se o usuário tem acesso ao tenant
  static async validateTenantAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { store: true },
      });

      if (!user) {
        return false;
      }

      // Admin tem acesso a todos os tenants
      if (user.role === 'ADMIN') {
        return true;
      }

      // Verificar se o usuário pertence ao tenant
      return user.storeId === tenantId;
    } catch (error) {
      console.error("Erro ao validar acesso ao tenant:", error);
      return false;
    }
  }

  // Obter informações completas do usuário com tenant
  static async getUserWithTenant(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          storeId: true,
          store: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              customDomain: true,
              isActive: true,
              stripeAccountId: true,
              stripeAccountStatus: true,
              payoutsEnabled: true,
              chargesEnabled: true,
              subscription: {
                select: {
                  id: true,
                  status: true,
                  currentPeriodStart: true,
                  currentPeriodEnd: true,
                  cancelAtPeriodEnd: true,
                  plan: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      interval: true,
                      price: true,
                      features: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário com tenant:", error);
      return null;
    }
  }
}

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
  verifyAccessToken,
} from "../../core/utils/jwt.utils";
import bcrypt from "bcrypt";
import prisma from "../../prisma/client";

export class AuthService {
  static async validateUser(
    email: string,
    password: string
  ): Promise<{ id: string; email: string } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, password: true },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return { id: user.id.toString(), email: user.email };
    } catch (error) {
      console.error("Erro ao validar usuário:", error);
      return null;
    }
  }

  static async login(
    email: string,
    password: string
  ): Promise<{
    user: { id: string; email: string };
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Armazenar refresh token no banco
    await prisma.user.update({
      where: { id: parseInt(user.id) },
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
      });

      if (!user) {
        throw new Error("Refresh token inválido");
      }

      // Verificar validade do token
      const payload = verifyRefreshToken(refreshToken);

      // Gerar novo access token
      const accessToken = signAccessToken({
        userId: payload.userId,
        email: payload.email,
      });

      // Opcional: Rotacionar refresh token (mais seguro)
      const shouldRotate = false; // Defina sua política de rotação

      if (shouldRotate) {
        const newRefreshToken = signRefreshToken({
          userId: payload.userId,
          email: payload.email,
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
      };
    } catch (error) {
      throw new Error("Access token inválido");
    }
  }
}

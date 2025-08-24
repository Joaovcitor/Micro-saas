import {
  signAccessToken,
  verifyRefreshToken,
  TokenPayload,
  verifyAccessToken,
} from "../../core/utils/jwt.utils";
import bcrypt from "bcrypt";
import prisma from "../../prisma/client";

const activeRefreshTokens = new Set<string>();

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

      const isPasswordValid = bcrypt.compare(password, user.password);

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
    tokens: { accessToken: string };
  }> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });

    return {
      user,
      tokens: { accessToken },
    };
  }

  static async logout(refreshToken: string): Promise<void> {
    activeRefreshTokens.delete(refreshToken);
  }

  static async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    // Verificar se o refresh token está ativo
    if (!activeRefreshTokens.has(refreshToken)) {
      throw new Error("Refresh token inválido");
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const accessToken = signAccessToken({
        userId: payload.userId,
        email: payload.email,
      });

      return { accessToken };
    } catch (error) {
      // Se o refresh token estiver inválido, remover da lista
      activeRefreshTokens.delete(refreshToken);
      throw new Error("Refresh token expirado");
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

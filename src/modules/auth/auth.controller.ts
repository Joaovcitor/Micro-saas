import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  getAuthCookies,
  setAuthCookies,
  clearAuthCookies,
  AuthCookies,
} from "../../core/utils/cookies.utils";
import prisma from "../../prisma/client";

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email e senha são obrigatórios",
        });
        return;
      }

      const { user, tokens } = await AuthService.login(email, password);

      setAuthCookies(res, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userId: user.id,
      });

      res.json({
        success: true,
        message: "Login realizado com sucesso",
        user,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Erro no login",
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const cookies = getAuthCookies(req.cookies);
      if (!cookies.accessToken) {
        res.status(401).json({
          success: false,
          message: "Token de acesso não encontrado",
        });
        return;
      }

      const payload = await AuthService.validateAccessToken(
        cookies.accessToken
      );
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true, role: true, store: true },
      });

      if (!user) {
        res
          .status(404)
          .json({ success: false, message: "Usuário não encontrado" });
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (e: any) {
      res.status(401).json({
        success: false,
        message: e.message || "Token inválido",
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const cookies = getAuthCookies(req.cookies);

      if (cookies.refreshToken) {
        await AuthService.logout(cookies.refreshToken);
      }

      clearAuthCookies(res);

      res.json({
        success: true,
        message: "Logout realizado com sucesso",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Erro no logout",
      });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const cookies = getAuthCookies(req.cookies);

      if (!cookies.refreshToken) {
        res.status(401).json({
          success: false,
          message: "Refresh token não encontrado",
        });
        return;
      }

      const { accessToken, newRefreshToken } =
        await AuthService.refreshAccessToken(cookies.refreshToken);

      const cookieData: AuthCookies = { accessToken };
      if (newRefreshToken) {
        cookieData.refreshToken = newRefreshToken;
      }

      setAuthCookies(res, cookieData);

      res.json({
        success: true,
        accessToken,
        newRefreshToken: newRefreshToken || undefined,
      });
    } catch (error: any) {
      clearAuthCookies(res);
      res.status(401).json({
        success: false,
        message: error.message || "Não foi possível renovar o token",
      });
    }
  }
}

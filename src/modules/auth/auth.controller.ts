import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  setAuthCookies,
  clearAuthCookies,
  getAuthCookies,
} from "../../core/utils/cookies.utils";

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

      const { accessToken } = await AuthService.refreshAccessToken(
        cookies.refreshToken
      );

      setAuthCookies(res, { accessToken });

      res.json({
        success: true,
        accessToken,
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

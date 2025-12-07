import { Request, Response, NextFunction } from "express";
import { getAuthCookies } from "../utils/cookies.utils";
import { AuthService } from "../../modules/auth/auth.service";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookies = getAuthCookies(req.cookies);

    if (!cookies.accessToken) {
      res.status(401).json({ error: "Token de acesso necessário" });
      return;
    }

    const payload = await AuthService.validateAccessToken(cookies.accessToken);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error: any) {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookies = getAuthCookies(req.cookies);

    if (cookies.accessToken) {
      const payload = await AuthService.validateAccessToken(
        cookies.accessToken
      );
      req.user = {
        userId: payload.userId,
        email: payload.email,
      };
    }

    next();
  } catch {
    // Se o token for inválido, continua sem userId
    next();
  }
};

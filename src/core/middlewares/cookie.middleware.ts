import { Request, Response, NextFunction } from "express";
import { cookieConfig } from "../utils/cookies.utils";

export const cookieMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Configurações padrão para cookies
  req.cookieOptions = { ...cookieConfig.defaultOptions };

  // Método helper para definir cookies de autenticação
  res.setAuthCookies = (cookies: any) => {
    const options = { ...req.cookieOptions };

    if (cookies.accessToken) {
      res.cookie(cookieConfig.names.accessToken, cookies.accessToken, {
        ...options,
        maxAge: cookieConfig.expiration.accessToken,
      });
    }

    if (cookies.refreshToken) {
      res.cookie(cookieConfig.names.refreshToken, cookies.refreshToken, {
        ...options,
        maxAge: cookieConfig.expiration.refreshToken,
      });
    }

    if (cookies.userId) {
      res.cookie(cookieConfig.names.userId, cookies.userId, {
        ...options,
        maxAge: cookieConfig.expiration.refreshToken,
      });
    }
  };

  // Método helper para limpar cookies de autenticação
  res.clearAuthCookies = () => {
    const options = { ...req.cookieOptions, maxAge: 0 };

    Object.values(cookieConfig.names).forEach((name) => {
      res.cookie(name, "", options);
    });
  };

  next();
};

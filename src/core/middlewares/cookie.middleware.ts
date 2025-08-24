import { Request, Response, NextFunction } from "express";
import { cookieConfig, AuthCookies } from "../utils/cookies.utils";

export const cookieMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.cookieOptions = { ...cookieConfig.defaultOptions };

  res.setAuthCookies = (cookies: AuthCookies) => {
    const { names, expiration } = cookieConfig;

    if (cookies.accessToken) {
      res.cookie(names.accessToken, cookies.accessToken, {
        ...req.cookieOptions,
        maxAge: expiration.accessToken,
      });
    }

    if (cookies.refreshToken) {
      res.cookie(names.refreshToken, cookies.refreshToken, {
        ...req.cookieOptions,
        maxAge: expiration.refreshToken,
      });
    }

    if (cookies.userId) {
      res.cookie(names.userId, cookies.userId, {
        ...req.cookieOptions,
        httpOnly: false,
        maxAge: expiration.refreshToken,
      });
    }
  };

  res.clearAuthCookies = () => {
    const { names } = cookieConfig;
    const options = {
      ...req.cookieOptions,
      maxAge: 0,
    };

    res.cookie(names.accessToken, "", options);
    res.cookie(names.refreshToken, "", options);
    res.cookie(names.userId, "", {
      ...options,
      httpOnly: false,
    });
  };

  next();
};

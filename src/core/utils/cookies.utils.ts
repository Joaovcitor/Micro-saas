import { Response } from "express";

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge?: number;
  domain?: string;
  path?: string;
}

export const cookieConfig = {
  defaultOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "strict" : ("lax" as const),
    path: "/",
  } as const,

  expiration: {
    accessToken: 15 * 60 * 1000,
    refreshToken: 7 * 24 * 60 * 60 * 1000,
  },

  names: {
    accessToken: "at",
    refreshToken: "rt",
    userId: "uid",
  },
};

export interface AuthCookies {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export const setAuthCookies = (
  res: Response,
  cookies: Partial<AuthCookies>
): void => {
  const options = cookieConfig.defaultOptions;

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

export const clearAuthCookies = (res: Response): void => {
  const options = { ...cookieConfig.defaultOptions, maxAge: 0 };

  Object.values(cookieConfig.names).forEach((name) => {
    res.cookie(name, "", options);
  });
};

export const getAuthCookies = (cookies: any): Partial<AuthCookies> => {
  return {
    accessToken: cookies[cookieConfig.names.accessToken],
    refreshToken: cookies[cookieConfig.names.refreshToken],
    userId: cookies[cookieConfig.names.userId],
  };
};

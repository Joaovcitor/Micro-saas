import { Response, Request } from "express";

export interface AuthCookies {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
}

export interface CookieConfig {
  names: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  };
  expiration: {
    accessToken: number;
    refreshToken: number;
  };
  defaultOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
  };
}

export const cookieConfig: CookieConfig = {
  names: {
    accessToken: "accessToken",
    refreshToken: "refreshToken",
    userId: "userId",
  },
  expiration: {
    accessToken: 60 * 60 * 1000 * 24,
    refreshToken: 7 * 24 * 60 * 60 * 1000,
  },
  defaultOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
};

export const setAuthCookies = (res: Response, cookies: AuthCookies): void => {
  const { names, expiration, defaultOptions } = cookieConfig;

  if (cookies.accessToken) {
    res.cookie(names.accessToken, cookies.accessToken, {
      ...defaultOptions,
      maxAge: expiration.accessToken,
    });
  }

  if (cookies.refreshToken) {
    res.cookie(names.refreshToken, cookies.refreshToken, {
      ...defaultOptions,
      maxAge: expiration.refreshToken,
    });
  }

  if (cookies.userId) {
    res.cookie(names.userId, cookies.userId, {
      ...defaultOptions,
      httpOnly: false,
      maxAge: expiration.refreshToken,
    });
  }
};

export const clearAuthCookies = (res: Response): void => {
  const { names, defaultOptions } = cookieConfig;

  const clearOptions = {
    ...defaultOptions,
    maxAge: 0,
  };

  res.cookie(names.accessToken, "", clearOptions);
  res.cookie(names.refreshToken, "", clearOptions);
  res.cookie(names.userId, "", {
    ...clearOptions,
    httpOnly: false,
  });
};

export const getAuthCookies = (cookies: any): AuthCookies => {
  const { names } = cookieConfig;

  return {
    accessToken: cookies[names.accessToken],
    refreshToken: cookies[names.refreshToken],
    userId: cookies[names.userId],
  };
};

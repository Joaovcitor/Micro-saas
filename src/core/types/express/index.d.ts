import express, { CookieOptions } from "express";

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email?: string;
      role?: string;
      storeId?: string;
      planType?: string;
    }

    interface Request {
      user?: UserPayload;
      cookieOptions?: CookieOptions;
    }

    interface Response {
      setAuthCookies?: (cookies: any) => void;
      clearAuthCookies?: () => void;
    }
  }
}

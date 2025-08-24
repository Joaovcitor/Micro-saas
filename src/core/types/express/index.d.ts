import express from "express";
import { CookieOptions } from "../../core/utils/cookies.utils";

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email?: string;
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

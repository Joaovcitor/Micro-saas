import { Response } from "express";

export interface AuthCookies {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
}

export const setAuthCookies = (res: Response, cookies: AuthCookies): void => {
  if (cookies.accessToken) {
    res.cookie("accessToken", cookies.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
    });
  }

  if (cookies.refreshToken) {
    res.cookie("refreshToken", cookies.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
  }

  if (cookies.userId) {
    res.cookie("userId", cookies.userId, {
      httpOnly: false, // Pode ser acessado pelo client
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("userId");
};

export const getAuthCookies = (cookies: any): AuthCookies => {
  return {
    accessToken: cookies.accessToken,
    refreshToken: cookies.refreshToken,
    userId: cookies.userId,
  };
};

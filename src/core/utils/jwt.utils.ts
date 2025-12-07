import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "default-secret-change-in-production";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "refresh-secret-change-in-production";

export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  storeId?: string;
  planType?: string;
  tenantId?: string;
  subscriptionStatus?: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};

export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};

interface UserPayload {
  id: string;
  name: string;
  role: string;
  storeId?: string;
}

declare namespace Express {
  export interface Request {
    user?: UserPayload;
  }
}

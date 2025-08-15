interface UserPayload {
  id: number;
  name: string;
  role: string;
}

declare namespace Express {
  export interface Request {
    user?: UserPayload;
  }
}

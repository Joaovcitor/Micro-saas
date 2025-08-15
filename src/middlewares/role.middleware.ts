import { Request, Response, NextFunction } from "express";

export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ errors: "Não autenticado!" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ errors: "Acesso negado!" });
    }
    next();
  };
}

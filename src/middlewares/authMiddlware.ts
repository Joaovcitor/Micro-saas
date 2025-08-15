import { Request, Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";
import { UserPayload } from "../types/auth";
interface JwtPayload {
  id: number;
}

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { jwt: token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, role: true },
    });
    if (!user) {
      return res.status(401).json({ error: "Usuário do token não encontrado" });
    }
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expirado. Por favor, faça login novamente." });
    }
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Token inválido (assinatura ou formato incorreto)." });
    }
    console.error("Erro inesperado no middleware:", error);
    return res
      .status(500)
      .json({ error: "Erro interno no servidor de autenticação." });
  }
}

import authService from "./auth.service";
import { Request, Response } from "express";

class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const result = await authService.login(email, password);
      res.cookie("jwt", result.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 8 * 60 * 60 * 1000,
      });
      return res.json({ user: result.user });
    } catch (e: any) {
      console.log(e);
      return res.status(401).json({ errors: "Erro de autenticação!" });
    }
  }
}

export default new AuthController();

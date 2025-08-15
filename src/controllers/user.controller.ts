import type { CreateUserDTO } from "../dtos/createUserDTO";
import userService from "../services/user.service";
import { Request, Response } from "express";

class UserController {
  async create(req: Request, res: Response) {
    const data: CreateUserDTO = req.body;
    try {
      const user = await userService.create(data);
      res.status(201).json(user);
    } catch (e: any) {
      console.log(e);
      res.status(500).json({ errors: "Erro interno do servidor!" });
    }
  }
}

export default new UserController();

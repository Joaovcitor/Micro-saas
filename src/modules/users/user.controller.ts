import { createStripeCustomer } from "../../utils/stripe";
import {
  CreateUserDTO,
  CreateStoreUserDTO,
  type CreateStoreDTO,
} from "./user.dto";
import userService from "./user.service";
import { Request, Response } from "express";

class UserController {
  async create(req: Request, res: Response) {
    const data: CreateUserDTO = req.body;
    const customer = await createStripeCustomer({
      email: data.email,
      name: data.name,
    });
    console.log(customer);

    // Validação básica
    if (!data.name || !data.email || !data.password) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e senha são obrigatórios",
      });
    }

    try {
      const user = await userService.create({
        ...data,
        stripeCustomerId: customer.id,
      });
      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        user,
      });
    } catch (e: any) {
      console.error("Erro ao criar usuário:", e);

      if (e.code === "P2002" && e.meta?.target?.includes("email")) {
        return res.status(409).json({
          success: false,
          message: "Este email já está em uso",
        });
      }

      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
  async createStoreUser(req: Request, res: Response) {
    const { user, store } = req.body;

    // Validação básica
    if (!user.name || !user.email || !user.password) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e senha são obrigatórios",
      });
    }
    try {
      const newUser = await userService.CreateUserAndStore(user, store);
      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        newUser,
      });
    } catch (e: any) {
      console.error("Erro ao criar usuário:", e);

      if (e.code === "P2002" && e.meta?.target?.includes("email")) {
        return res.status(409).json({
          success: false,
          message: "Este email já está em uso",
        });
      }

      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}

export default new UserController();

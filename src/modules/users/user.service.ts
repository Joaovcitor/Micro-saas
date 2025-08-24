import type { User } from "@prisma/client";
import prisma from "../../prisma/client";
import type { CreateUserDTO } from "./user.dto";
import { generateHashPassword } from "../../core/utils/utilsPassword";

class UserService {
  async create(data: CreateUserDTO): Promise<User> {
    const hashPassword = await generateHashPassword(data.password);
    return await prisma.user.create({
      data: {
        ...data,
        password: hashPassword,
      },
    });
  }
}

export default new UserService();

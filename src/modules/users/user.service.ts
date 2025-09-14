import prisma from "../../prisma/client";
import type { CreateUserDTO } from "./user.dto";
import { generateHashPassword } from "../../core/utils/utilsPassword";

interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

class UserService {
  async create(data: CreateUserDTO): Promise<UserResponse> {
    const hashPassword = await generateHashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }
}

export default new UserService();

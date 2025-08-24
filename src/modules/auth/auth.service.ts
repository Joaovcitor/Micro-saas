import prisma from "../../prisma/client";
import jwt from "jsonwebtoken";
import { comparePassword } from "../../core/utils/utilsPassword";
import type { User } from "@prisma/client";

class AuthService {
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: Partial<User> }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) throw new Error("Invalid password");

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }
}

export default new AuthService();

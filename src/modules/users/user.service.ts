import prisma from "../../prisma/client";
import { CreateStoreDTO, CreateUserDTO, UserResponse } from "./user.dto";
import { generateHashPassword } from "../../core/utils/utilsPassword";
import type { Store } from "@prisma/client";

interface UserAndStoreResponse {
  user: UserResponse;
  store: Store;
}

class UserService {
  async create(data: CreateUserDTO): Promise<UserResponse> {
    const hashPassword = await generateHashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashPassword,
        stripeCustomerId: data.stripeCustomerId,
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

  async CreateUserAndStore(
    data: CreateUserDTO,
    dataStore: CreateStoreDTO
  ): Promise<UserAndStoreResponse> {
    const hashPassword = await generateHashPassword(data.password);
    const userExist = await prisma.user.findUnique({
      where: { email: data.email },
    });
    const storeExist = await prisma.store.findUnique({
      where: { subdomain: dataStore.subDomain },
    });
    if (userExist) {
      throw new Error("Email já cadastrado");
    }
    if (storeExist) {
      throw new Error("Subdomínio já cadastrado");
    }
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashPassword,
          stripeCustomerId: data.stripeCustomerId,
          role: "OWNER",
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

      const store = await tx.store.create({
        data: {
          ownerId: user.id,
          name: dataStore.name,
          subdomain: dataStore.subDomain,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { storeId: store.id },
      });

      return { user, store };
    });
  }
}

export default new UserService();

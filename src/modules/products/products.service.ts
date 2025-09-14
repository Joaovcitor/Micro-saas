import type { Product } from "@prisma/client";
import prisma from "../../prisma/client";
import type { CreateProductDTO } from "./product.dto";
import type { UpdateProductDTO } from "./product.dto";
class ProductService {
  async getAllProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      include: {
        photos: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return products;
  }

  async getProductById(id: number): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        photos: true,
        productCustomizations: true,
      },
    });
  }

  async create(
    data: CreateProductDTO,
    ownerId: number,
    photos: string[],
    categoryId: number
  ) {
    return await prisma.product.create({
      data: {
        ...data,
        owner: {
          connect: { id: ownerId },
        },
        photos: {
          create: photos.map((url) => ({ url })),
        },
        category: {
          connect: { id: categoryId },
        },
      },
      include: {
        photos: true,
      },
    });
  }

  async update(id: number, data: UpdateProductDTO): Promise<Product> {
    if (!id) {
      throw new Error("Id inválido!");
    }

    if (!data) {
      throw new Error("Dados para atualização não fornecidos!");
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new Error("Produto não encontrado!");
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.isAvailable !== undefined)
      updateData.isAvailable = data.isAvailable;

    if (data.photos && data.photos.length > 0) {
      updateData.photos = {
        deleteMany: {}, // Remove fotos existentes
        create: data.photos.map((url) => ({ url })),
      };
    }

    return await prisma.product.update({
      where: { id },
      data: updateData,
    });
  }
}

export default new ProductService();

import type { Category } from "@prisma/client";
import prisma from "../../prisma/client";
import type { CategoryCreateDTO, CategoryUpdateDTO } from "./category.dto";

class CategoryService {
  async createCategory(data: CategoryCreateDTO): Promise<Category> {
    const existCategory = await prisma.category.findFirst({
      where: {
        name: data.name,
        storeId: data.storeId,
      },
    });
    if (existCategory) {
      throw new Error("Categoria com esse nome já cadastrada!");
    }
    return prisma.category.create({
      data,
    });
  }

  async update(data: CategoryUpdateDTO, id: string): Promise<Category> {
    const existCategory = await prisma.category.findFirst({
      where: {
        id: id,
      },
    });
    if (!existCategory) {
      throw new Error("Categoria com esse id não cadastrada!");
    }
    return prisma.category.update({ where: { id }, data: { name: data.name } });
  }

  async getAll(): Promise<Category[]> {
    return prisma.category.findMany({
      include: {
        products: true,
      },
    });
  }

  async getById(id: string): Promise<Category> {
    if (!id) {
      throw new Error("Id inválido!");
    }
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });
    if (!category) {
      throw new Error("Categoria não encontrada!");
    }
    return category;
  }

  async productsWithCategory(id: string): Promise<Category> {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        products: {
          include: {
            photos: true,
          },
        },
      },
    });
    if (!category) {
      throw new Error("Categoria não encontrada!");
    }
    return category;
  }
}

export default new CategoryService();

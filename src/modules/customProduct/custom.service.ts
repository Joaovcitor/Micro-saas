import {
  ProductCustomizationDTOCreate,
  CustomizationOptionDTOCreate,
  OrderItemCustomizationDTOCreate,
} from "./custom.dto";
import prisma from "../../prisma/client";
import type { CustomizationOption, ProductCustomization } from "@prisma/client";

export class CustomProductService {
  async create(data: ProductCustomizationDTOCreate) {
    const newProductCustomization = await prisma.productCustomization.create({
      data: {
        ...data,
        options: {
          create: data.options,
        },
      },
    });
    return newProductCustomization;
  }
  async getAll() {
    const customProducts = await prisma.productCustomization.findMany({
      include: {
        options: true,
        product: true,
      },
    });
    return customProducts;
  }
  async getCustomizationProductById(
    id: number
  ): Promise<ProductCustomization[]> {
    if (!id) {
      throw new Error("Id inválido!");
    }
    const customProduct = await prisma.productCustomization.findMany({
      where: { productId: id },
      include: {
        options: true,
      },
    });
    if (!customProduct) {
      throw new Error("Customização não encontrada!");
    }
    return customProduct;
  }
  async addNewOptionInProduct(
    id: number,
    data: CustomizationOptionDTOCreate
  ): Promise<CustomizationOption> {
    const newOption = await prisma.customizationOption.create({
      data: {
        ...data,
        customizationId: id,
      },
    });
    return newOption;
  }
}

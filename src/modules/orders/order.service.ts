import { StatusPedido } from "./../../../node_modules/.prisma/client/index.d";
import type { MetodoPagamento } from "@prisma/client";
import prisma from "../../prisma/client";
import type {
  CreateOrderDto,
  OrderCustomizationItems,
  OrderItemDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from "./order.dto";

class OrderService {
  async getAllOrders(
    page: number,
    limit: number = 50,
    startDate: Date,
    endDate: Date
  ): Promise<{ data: OrderResponseDto[]; meta: any }> {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lt: new Date(endDate),
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "asc",
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count(),
    ]);
    return {
      data: orders.map((order) => this.formatOrderResponse(order)),
      meta: {
        total,
        page,
        limit,
      },
    };
  }
  async getOrderById(orderId: string): Promise<OrderResponseDto> {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!order) {
      throw new Error("Pedido não encontrado");
    }
    return this.formatOrderResponse(order);
  }
  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto
  ): Promise<OrderResponseDto> {
    return await prisma.$transaction(async (prisma) => {
      const { validItems, total } = await this.validateOrderItems(
        createOrderDto.items
      );

      for (const item of validItems) {
        const product = await prisma.product.findUnique({
          where: {
            id: item.productId,
          },
        });
        if (product?.type === "PHYSICAL" && product.stock !== null) {
          if (product.stock < item.quantity) {
            throw new Error(
              `Quantidade insuficiente para o produto ${product.name}`
            );
          }
          await this.updateProduct(product.id, item.quantity);
        }
      }

      const order = await prisma.order.create({
        data: {
          userId: userId,
          status: "EM_PREPARO",
          totalPrice: total,
          storeId: createOrderDto.storeId,
          enderecoEntrega: createOrderDto.enderecoEntrega,
          metodoPagamento: createOrderDto.metodoPagamento as MetodoPagamento,
          orderItems: {
            create: validItems.map((item) => ({
              product: {
                connect: {
                  id: item.productId,
                },
              },
              quantity: item.quantity,
              subtotal: item.quantity * item.price,
              price: item.price,
              customizations: {
                create:
                  item.customizations?.map((customization) => ({
                    optionId: customization.optionId,
                    price: customization.price,
                    name: customization.name || "",
                    quantity: customization.quantity,
                  })) || [],
              },
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
              customizations: {
                select: {
                  optionId: true,
                  price: true,
                },
              },
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return this.formatOrderResponse(order);
    });
  }

  async ordersOfUser(
    page: number,
    userId: string,
    limit: number = 10
  ): Promise<{ data: OrderResponseDto[]; meta: any }> {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: userId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({
        where: {
          userId: userId,
        },
      }),
    ]);

    return {
      data: orders.map((order) => this.formatOrderResponse(order)),
      meta: {
        total,
        lastPage: Math.ceil(total / limit),
        page,
      },
    };
  }

  async updateOrderStatus(orderId: string, status: UpdateOrderStatusDto) {
    if (!orderId) {
      throw new Error("Id do pedido inválido");
    }
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("Pedido não encontrado");
    }
    return await prisma.order.update({
      where: { id: orderId },
      data: { status: status.status as StatusPedido },
    });
  }

  private async validateCustomizations(items: OrderCustomizationItems[]) {
    const optionIds = items.map((item) => item.optionId);
    const options = await prisma.customizationOption.findMany({
      where: {
        id: { in: optionIds },
      },
    });
    let total = 0;
    const validItems = [];

    for (const item of items) {
      const option = options.find((o) => o.id === item.optionId);
      if (!option) {
        throw new Error(`Opção ${item.optionId} não encontrada`);
      }

      if (option.price !== item.price) {
        throw new Error(`Preço da opção ${item.optionId} não corresponde`);
      }
      total += item.price * item.quantity;
      validItems.push(item);
    }
    return { validItems, total };
  }

  private async updateProduct(id: string, stock: number) {
    await prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: stock,
        },
      },
    });
  }

  private async validateOrderItems(items: OrderItemDto[]): Promise<{
    validItems: Array<OrderItemDto & { price: number }>;
    total: number;
  }> {
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true,
      },
      select: { id: true, price: true, name: true, type: true, stock: true },
    });

    let total = 0;
    const validItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(
          `Produto ${item.productId} não encontrado ou indisponível`
        );
      }

      if (
        product.type === "PHYSICAL" &&
        product.stock !== null &&
        item.quantity > product.stock
      ) {
        throw new Error("Quantidade invalida!");
      }

      let customizations: OrderCustomizationItems[] = [];
      let totalCustomizations = 0;
      if (item.customizations && item.customizations.length > 0) {
        const { validItems: validateCustomizations, total: total } =
          await this.validateCustomizations(item.customizations);
        customizations = validateCustomizations;
        totalCustomizations = total;
      }
      const itemTotal = product.price * item.quantity + totalCustomizations;
      total += itemTotal;

      validItems.push({
        ...item,
        price: product.price,
        customizations,
        totalCustomizations,
      });
    }

    return { validItems, total };
  }

  private formatOrderResponse(order: any): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      metodoPagamento: order.metodoPagamento,
      orderItems: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      user: {
        name: order.user.name,
        email: order.user.email,
      },
    };
  }
}

export default OrderService;

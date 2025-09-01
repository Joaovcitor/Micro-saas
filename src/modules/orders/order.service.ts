import prisma from "../../prisma/client";
import type {
  CreateOrderDto,
  OrderItemDto,
  OrderResponseDto,
} from "./order.dto";

class OrderService {
  async createOrder(
    userId: number,
    createOrderDto: CreateOrderDto
  ): Promise<OrderResponseDto> {
    return await prisma.$transaction(async (prisma) => {
      const { validItems, total } = await this.validateOrderItems(
        createOrderDto.items
      );

      const order = await prisma.order.create({
        data: {
          userId: userId,
          status: "EM_PREPARO",
          totalPrice: total,
          orderItems: {
            create: validItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              subtotal: item.quantity * item.price,
              price: item.price,
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
            },
          },
        },
      });

      return this.formatOrderResponse(order);
    });
  }

  async ordersOfUser(userId: number): Promise<OrderResponseDto[]> {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
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
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return orders.map((order) => this.formatOrderResponse(order));
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
      select: { id: true, price: true, name: true },
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

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      validItems.push({
        ...item,
        price: product.price,
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
      orderItems: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
    };
  }
}

export default OrderService;

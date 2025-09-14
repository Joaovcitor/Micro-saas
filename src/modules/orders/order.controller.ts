import { Request, Response } from "express";
import OrderService from "./order.service";
import type {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderResponseDto,
} from "./order.dto";

class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
      const order = await this.orderService.getOrderById(Number(id));
      res.status(200).json({
        message: "Pedido encontrado com sucesso",
        data: order,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        message: "Erro ao buscar pedido",
        error: e.message,
      });
    }
  };
  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.getAllOrders();
      res.status(200).json({
        message: "Pedidos encontrados com sucesso",
        data: orders,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        message: "Erro ao buscar pedidos",
        error: e.message,
      });
    }
  };
  getAllOrdersOfUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const orders = await this.orderService.ordersOfUser(Number(userId));
      res.status(200).json({
        message: "Pedidos encontrados com sucesso",
        data: orders,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        message: "Erro ao buscar pedidos",
        error: e.message,
      });
    }
  };
  updateOrder = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const updateOrderStatusDto: UpdateOrderStatusDto = req.body;
    try {
      const order = await this.orderService.updateOrderStatus(
        id,
        updateOrderStatusDto
      );
      res.status(200).json({
        message: "Pedido atualizado com sucesso",
        data: order,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        message: "Erro ao atualizar pedido",
        error: e.message,
      });
    }
  };
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          message: "Usuário não autenticado",
        });
        return;
      }

      const createOrderDto: CreateOrderDto = req.body;

      if (!createOrderDto.items || createOrderDto.items.length === 0) {
        res.status(400).json({
          message: "O pedido deve conter pelo menos um item",
        });
        return;
      }

      const order: OrderResponseDto = await this.orderService.createOrder(
        Number(userId),
        createOrderDto
      );

      res.status(201).json({
        message: "Pedido criado com sucesso",
        data: order,
      });
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);

      if (error.message.includes("não encontrado ou indisponível")) {
        res.status(400).json({
          message: error.message,
        });
      } else {
        res.status(500).json({
          message: "Erro interno ao processar pedido",
        });
      }
    }
  };
}

export default OrderController;

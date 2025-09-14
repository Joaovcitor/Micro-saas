import express from "express";
import OrderController from "./order.controller";
import { authMiddleware } from "../../core/middlewares/authMiddlware"; // Seu middleware de autenticação

const orderRouter = express.Router();
const orderController = new OrderController();

orderRouter.use(authMiddleware);

orderRouter.post("/", orderController.createOrder);
orderRouter.get("/", orderController.getAllOrdersOfUser);
orderRouter.get("/all", orderController.getAllOrders);
orderRouter.get("/:id", orderController.getOrderById);
orderRouter.put("/:id", orderController.updateOrder);

export default orderRouter;

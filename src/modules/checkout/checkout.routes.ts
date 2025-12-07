import { Router } from "express";
import CheckoutController from "./checkout.controller";
import { authMiddleware } from "../../core/middlewares/authMiddleware";

const checkoutRouter = Router();
checkoutRouter.get("/", authMiddleware, CheckoutController.createCheckout);
export default checkoutRouter;

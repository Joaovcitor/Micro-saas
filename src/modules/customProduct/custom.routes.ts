import { Router } from "express";
import { CustomProductController } from "./custom.controller";
import { authMiddleware } from "../../core/middlewares/authMiddlware";

const customProductRouter = Router();
const customProductController = new CustomProductController();

customProductRouter.post("/", authMiddleware, customProductController.create);
customProductRouter.get(
  "/",
  authMiddleware,
  customProductController.getAllCustomizationOptions
);

customProductRouter.get(
  "/product/:id",
  customProductController.getCustomizationProductById
);
customProductRouter.post(
  "/option/:id",
  customProductController.addNewOptionInProduct
);

export default customProductRouter;

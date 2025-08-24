import { Router } from "express";
import categoryController from "./category.controller";
const categoryRouter = Router();

categoryRouter.post("/", categoryController.createCategory);
categoryRouter.patch("/:id", categoryController.updateCategory);
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:id", categoryController.getCategoryById);

export default categoryRouter;

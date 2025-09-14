import productController from "./product.controller";
import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddlware";
import { upload } from "../../core/middlewares/upload.middleware";
const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.array("photos", 5),
  productController.create
);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.patch(
  "/:id",
  authMiddleware,
  upload.array("photos", 5),
  productController.update
);

export default router;

import productController from "../controllers/product.controller";
import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddlware";
import { upload } from "../middlewares/upload.middleware";
const router = Router();

router.post(
  "/",
  isAuthenticated,
  upload.array("photos", 5),
  productController.create
);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.patch("/:id", isAuthenticated, productController.update);

export default router;

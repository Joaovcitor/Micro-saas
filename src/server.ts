import express, { Application } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import userRouter from "./modules/users/user.routes";
import productRoutes from "./modules/products/product.routes";
import { cookieMiddleware } from "./core/middlewares/cookie.middleware";
import categoryRouter from "./modules/category/category.routes";
import orderRouter from "./modules/orders/order.routes";
import path from "path";
import customProductRouter from "./modules/customProduct/custom.routes";
import checkoutRouter from "./modules/checkout/checkout.routes";
import { WebhookRoute } from "./modules/webhooks/webhooks.routes";
dotenv.config();

class Server {
  private app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.webhook();
    this.middlewares();
    this.routes();
    this.listen();
  }

  private middlewares(): void {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:8080",
        credentials: true,
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    const uploadsPath = path.join(process.cwd(), "src", "uploads");
    console.log("Serving static files from:", uploadsPath);

    this.app.use("/uploads", (req, res, next) => {
      res.removeHeader("Cross-Origin-Resource-Policy");
      res.header("Cross-Origin-Resource-Policy", "cross-origin");
      res.header(
        "Access-Control-Allow-Origin",
        process.env.FRONTEND_URL || "http://localhost:3000"
      );
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    this.app.use("/uploads", express.static(uploadsPath));

    // Cookies
    this.app.use(
      cookieParser(
        process.env.COOKIE_SECRET || "cookie-secret-change-in-production"
      )
    );
    this.app.use(cookieMiddleware);
  }

  private routes(): void {
    this.app.use("/auth", authRoutes);
    this.app.use("/users", userRouter);
    this.app.use("/products", productRoutes);
    this.app.use("/category", categoryRouter);
    this.app.use("/custom", customProductRouter);
    this.app.use("/orders", orderRouter);
    this.app.use("/checkout", checkoutRouter);
  }

  private webhook(): void {
    const router = express.Router();
    WebhookRoute.create(router);
    this.app.use("/data", router);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor rodando na porta ${this.port}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🔗 Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
      );
    });
  }
}

export default Server;

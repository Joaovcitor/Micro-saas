import express, { Application } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import productRoutes from "./routes/product.routes";

dotenv.config();

class Server {
  private app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(cookieParser());
  }

  private routes(): void {
    this.app.use("/auth", authRoutes);
    this.app.use("/users", userRouter);
    this.app.use("/products", productRoutes);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor rodando na porta ${this.port}`);
    });
  }
}

export default Server;

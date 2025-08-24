import { Router } from "express";
import { AuthController } from "./auth.controller";
const authRouter = Router();

authRouter.post("/login", AuthController.login);
authRouter.get("/me", AuthController.getCurrentUser);

export default authRouter;
